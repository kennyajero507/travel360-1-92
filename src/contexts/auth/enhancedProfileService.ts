
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

interface ProfileServiceOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

class EnhancedProfileService {
  private readonly options: Required<ProfileServiceOptions>;
  private retryAttempts = new Map<string, number>();

  constructor(options: ProfileServiceOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      timeout: options.timeout ?? 5000,
    };
  }

  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const cacheKey = `profile_${userId}`;
    
    try {
      console.log('[EnhancedProfileService] Fetching profile for user:', userId);
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), this.options.timeout);
      });

      // Create fetch promise
      const fetchPromise = this.performProfileFetch(userId);

      // Race between fetch and timeout
      const profile = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (profile) {
        console.log('[EnhancedProfileService] Profile fetched successfully:', profile);
        this.retryAttempts.delete(cacheKey);
        return profile;
      }

      console.warn('[EnhancedProfileService] No profile found, attempting repair...');
      return await this.repairUserProfileWithRetry(userId);

    } catch (error) {
      console.error('[EnhancedProfileService] Error fetching profile:', error);
      
      // Check if we should retry
      const attempts = this.retryAttempts.get(cacheKey) || 0;
      if (attempts < this.options.maxRetries) {
        this.retryAttempts.set(cacheKey, attempts + 1);
        console.log(`[EnhancedProfileService] Retrying profile fetch (${attempts + 1}/${this.options.maxRetries})`);
        
        await this.delay(this.options.retryDelay * Math.pow(2, attempts));
        return this.fetchUserProfile(userId);
      }

      this.retryAttempts.delete(cacheKey);
      return null;
    }
  }

  private async performProfileFetch(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[EnhancedProfileService] Database error:', error);
      
      // Handle specific RLS errors
      if (error.code === 'PGRST301' || error.message.includes('row-level security')) {
        throw new Error('Access denied: Profile security check failed');
      }
      
      // Handle missing profile
      if (error.code === 'PGRST116') {
        return null;
      }
      
      throw error;
    }

    return data as UserProfile | null;
  }

  async repairUserProfileWithRetry(userId: string): Promise<UserProfile | null> {
    const repairKey = `repair_${userId}`;
    
    try {
      console.log('[EnhancedProfileService] Attempting profile repair for user:', userId);

      // Get current user from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user || user.id !== userId) {
        console.error('[EnhancedProfileService] Cannot repair - auth user mismatch');
        throw new Error('Authentication mismatch during profile repair');
      }

      // Create profile data
      const profileData = {
        id: userId,
        full_name: this.extractFullName(user),
        email: user.email,
        role: this.extractRole(user),
        created_at: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      };

      console.log('[EnhancedProfileService] Creating profile with data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('[EnhancedProfileService] Profile repair failed:', error);
        
        // Check for existing profile conflict
        if (error.code === '23505') {
          console.log('[EnhancedProfileService] Profile already exists, fetching...');
          return await this.performProfileFetch(userId);
        }
        
        throw error;
      }

      console.log('[EnhancedProfileService] Profile repaired successfully:', data);
      return data as UserProfile;

    } catch (error) {
      console.error('[EnhancedProfileService] Profile repair error:', error);
      
      // Retry logic for repair
      const attempts = this.retryAttempts.get(repairKey) || 0;
      if (attempts < this.options.maxRetries) {
        this.retryAttempts.set(repairKey, attempts + 1);
        console.log(`[EnhancedProfileService] Retrying profile repair (${attempts + 1}/${this.options.maxRetries})`);
        
        await this.delay(this.options.retryDelay * Math.pow(2, attempts));
        return this.repairUserProfileWithRetry(userId);
      }

      this.retryAttempts.delete(repairKey);
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      console.log('[EnhancedProfileService] Performing health check...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[EnhancedProfileService] Health check: No authenticated user');
        return false;
      }

      // Test database connectivity
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        console.error('[EnhancedProfileService] Health check failed:', error);
        return false;
      }

      console.log('[EnhancedProfileService] Health check passed');
      return true;
    } catch (error) {
      console.error('[EnhancedProfileService] Health check error:', error);
      return false;
    }
  }

  async debugUserProfile(userId?: string): Promise<any> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) {
        return { error: 'No user ID available' };
      }

      const { data, error } = await supabase.rpc('debug_user_profile', {
        target_user_id: targetUserId
      });

      if (error) {
        console.error('[EnhancedProfileService] Debug function error:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('[EnhancedProfileService] Debug error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private extractFullName(user: any): string {
    return user.user_metadata?.full_name ||
           user.user_metadata?.name ||
           user.email?.split('@')[0] ||
           'User';
  }

  private extractRole(user: any): string {
    return user.user_metadata?.role || 'org_owner';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clean up retry attempts periodically
  clearRetryCache(): void {
    this.retryAttempts.clear();
  }
}

export const enhancedProfileService = new EnhancedProfileService();
