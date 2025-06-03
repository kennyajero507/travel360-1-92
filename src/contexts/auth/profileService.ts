
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';
import { toast } from 'sonner';

export const profileService = {
  async fetchUserProfile(userId: string, retryCount = 0): Promise<UserProfile | null> {
    const maxRetries = 3;
    const timeout = 10000; // 10 seconds timeout
    
    try {
      console.log(`[ProfileService] Fetching profile for user: ${userId} (attempt ${retryCount + 1})`);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), timeout);
      });
      
      // Race between the actual query and timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);
      
      if (error) {
        console.error('[ProfileService] Error fetching user profile:', error);
        
        // Handle specific error types
        if (error.message.includes('row-level security') || 
            error.message.includes('permission denied') ||
            error.message.includes('infinite recursion')) {
          console.error('[ProfileService] RLS/Permission error - creating fallback profile');
          return await this.createFallbackProfile(userId);
        }
        
        // For other errors, retry if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          const delayMs = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
          console.log(`[ProfileService] Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return this.fetchUserProfile(userId, retryCount + 1);
        }
        
        throw error;
      }
      
      if (!data) {
        console.log("[ProfileService] No profile found - creating fallback profile");
        return await this.createFallbackProfile(userId);
      }
      
      // Get user email from auth if not in profile
      const { data: user } = await supabase.auth.getUser();
      
      const profile: UserProfile = {
        id: data.id,
        full_name: data.full_name || user.user?.email?.split('@')[0] || 'User',
        email: user.user?.email || data.email || null,
        role: data.role || 'org_owner',
        org_id: data.org_id,
        trial_ends_at: data.trial_ends_at,
        created_at: data.created_at || new Date().toISOString()
      };
      
      console.log("[ProfileService] Profile fetched successfully:", {
        id: profile.id,
        role: profile.role,
        org_id: profile.org_id,
        has_email: !!profile.email
      });
      
      return profile;
    } catch (error) {
      console.error(`[ProfileService] Error in fetchUserProfile (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for non-permission errors
      if (retryCount < maxRetries && !error.message.includes('Permission denied')) {
        const delayMs = Math.min(1000 * Math.pow(2, retryCount), 5000);
        console.log(`[ProfileService] Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return this.fetchUserProfile(userId, retryCount + 1);
      }
      
      // Final fallback - create minimal profile
      console.error('[ProfileService] All retries failed - creating final fallback profile');
      return await this.createFallbackProfile(userId);
    }
  },

  async createFallbackProfile(userId: string): Promise<UserProfile> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const fallbackProfile: UserProfile = {
        id: userId,
        full_name: user.user?.email?.split('@')[0] || 'User',
        email: user.user?.email || '',
        role: 'org_owner',
        org_id: null,
        trial_ends_at: null,
        created_at: new Date().toISOString()
      };
      
      console.log('[ProfileService] Created fallback profile:', fallbackProfile);
      return fallbackProfile;
    } catch (error) {
      console.error('[ProfileService] Error creating fallback profile:', error);
      
      // Absolute minimal fallback
      return {
        id: userId,
        full_name: 'User',
        email: '',
        role: 'org_owner',
        org_id: null,
        trial_ends_at: null,
        created_at: new Date().toISOString()
      };
    }
  },

  async ensureProfileExists(userId: string): Promise<UserProfile> {
    try {
      console.log(`[ProfileService] Ensuring profile exists for user: ${userId}`);
      
      // First try to fetch existing profile
      let profile = await this.fetchUserProfile(userId);
      
      if (profile) {
        return profile;
      }
      
      // If no profile exists, try to create one
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: user.user?.email?.split('@')[0] || 'User',
          email: user.user?.email || '',
          role: 'org_owner',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('[ProfileService] Error creating profile:', error);
        return this.createFallbackProfile(userId);
      }
      
      return {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        org_id: data.org_id,
        trial_ends_at: data.trial_ends_at,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('[ProfileService] Error in ensureProfileExists:', error);
      return this.createFallbackProfile(userId);
    }
  },

  checkRoleAccess(userProfile: UserProfile | null, allowedRoles: string[]): boolean {
    if (!userProfile) return false;
    
    // Always grant access to system admins
    if (userProfile.role === 'system_admin') return true;
    
    return allowedRoles.includes(userProfile.role);
  }
};
