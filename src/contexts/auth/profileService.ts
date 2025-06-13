
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';
import { toast } from 'sonner';

export const profileService = {
  async fetchUserProfile(userId: string, retryCount = 0): Promise<UserProfile | null> {
    const maxRetries = 2; // Reduced retries to prevent infinite loops
    const timeout = 8000; // Reduced timeout
    
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
        
        if (retryCount < maxRetries) {
          const delayMs = 1000 * (retryCount + 1); // Linear backoff
          console.log(`[ProfileService] Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return this.fetchUserProfile(userId, retryCount + 1);
        }
        
        return await this.createFallbackProfile(userId);
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
        created_at: data.created_at || new Date().toISOString(),
        preferred_currency: data.preferred_currency || 'USD'
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
      
      if (retryCount < maxRetries) {
        const delayMs = 1000 * (retryCount + 1);
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
        created_at: new Date().toISOString(),
        preferred_currency: 'USD'
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
        created_at: new Date().toISOString(),
        preferred_currency: 'USD'
      };
    }
  },

  async ensureProfileExists(userId: string): Promise<UserProfile> {
    try {
      console.log(`[ProfileService] Ensuring profile exists for user: ${userId}`);
      
      // First try to fetch existing profile with a short timeout
      const existingProfile = await this.fetchUserProfile(userId);
      
      if (existingProfile && existingProfile.email) {
        console.log('[ProfileService] Found complete existing profile');
        return existingProfile;
      }
      
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.email) {
        console.error('[ProfileService] No email found for user');
        return this.createFallbackProfile(userId);
      }
      
      // Try to create or update profile in database
      try {
        console.log('[ProfileService] Creating/updating profile in database');
        const profileData = {
          id: userId,
          full_name: user.user.email.split('@')[0] || 'User',
          email: user.user.email,
          role: 'org_owner',
          preferred_currency: 'USD',
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'id'
          })
          .select()
          .single();
        
        if (error) {
          console.error('[ProfileService] Error creating/updating profile:', error);
          // Still return the profile data we have
          return {
            ...profileData,
            org_id: null,
            trial_ends_at: null
          };
        }
        
        console.log('[ProfileService] Successfully created/updated profile in database');
        return {
          id: data.id,
          full_name: data.full_name,
          email: data.email,
          role: data.role,
          org_id: data.org_id,
          trial_ends_at: data.trial_ends_at,
          created_at: data.created_at,
          preferred_currency: data.preferred_currency || 'USD'
        };
      } catch (profileError) {
        console.error('[ProfileService] Profile creation failed, using local profile:', profileError);
        return {
          id: userId,
          full_name: user.user.email.split('@')[0] || 'User',
          email: user.user.email,
          role: 'org_owner',
          org_id: null,
          trial_ends_at: null,
          created_at: new Date().toISOString(),
          preferred_currency: 'USD'
        };
      }
    } catch (error) {
      console.error('[ProfileService] Error in ensureProfileExists:', error);
      return this.createFallbackProfile(userId);
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log('[ProfileService] Updating profile:', userId, updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('[ProfileService] Error updating profile:', error);
        toast.error('Failed to update profile');
        return null;
      }
      
      console.log('[ProfileService] Profile updated successfully');
      return {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        org_id: data.org_id,
        trial_ends_at: data.trial_ends_at,
        created_at: data.created_at,
        preferred_currency: data.preferred_currency || 'USD'
      };
    } catch (error) {
      console.error('[ProfileService] Error updating profile:', error);
      toast.error('Failed to update profile');
      return null;
    }
  },

  checkRoleAccess(userProfile: UserProfile | null, allowedRoles: string[]): boolean {
    if (!userProfile) return false;
    
    if (userProfile.role === 'system_admin') return true;
    
    return allowedRoles.includes(userProfile.role);
  }
};
