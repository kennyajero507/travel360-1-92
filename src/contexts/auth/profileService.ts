
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';
import { toast } from 'sonner';

export const profileService = {
  async fetchUserProfile(userId: string, retryCount = 0): Promise<UserProfile | null> {
    const maxRetries = 3;
    const timeout = 10000;
    
    try {
      console.log(`[ProfileService] Fetching profile for user: ${userId} (attempt ${retryCount + 1})`);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), timeout);
      });
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);
      
      if (error) {
        console.error('[ProfileService] Error fetching user profile:', error);
        
        if (error.message.includes('row-level security') || 
            error.message.includes('permission denied') ||
            error.message.includes('infinite recursion')) {
          console.error('[ProfileService] RLS/Permission error - creating fallback profile');
          return await this.createFallbackProfile(userId);
        }
        
        if (retryCount < maxRetries) {
          const delayMs = Math.min(1000 * Math.pow(2, retryCount), 5000);
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
      
      if (retryCount < maxRetries && !error.message.includes('Permission denied')) {
        const delayMs = Math.min(1000 * Math.pow(2, retryCount), 5000);
        console.log(`[ProfileService] Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return this.fetchUserProfile(userId, retryCount + 1);
      }
      
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
      
      let profile = await this.fetchUserProfile(userId);
      
      if (profile && profile.email) {
        return profile;
      }
      
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.email) {
        console.error('[ProfileService] No email found for user');
        return this.createFallbackProfile(userId);
      }
      
      // Try to create or update profile with email
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: user.user.email.split('@')[0] || 'User',
          email: user.user.email,
          role: 'org_owner',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();
      
      if (error) {
        console.error('[ProfileService] Error creating/updating profile:', error);
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
    
    if (userProfile.role === 'system_admin') return true;
    
    return allowedRoles.includes(userProfile.role);
  }
};
