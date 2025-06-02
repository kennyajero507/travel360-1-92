
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const profileService = {
  async fetchUserProfile(userId: string, retryCount = 0): Promise<UserProfile | null> {
    const maxRetries = 3;
    const timeout = 5000; // 5 seconds timeout
    
    try {
      console.log(`Fetching profile for user: ${userId} (attempt ${retryCount + 1})`);
      
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
        console.error('Error fetching user profile:', error);
        
        // If it's an RLS or permission error, don't retry
        if (error.message.includes('row-level security') || 
            error.message.includes('permission denied') ||
            error.message.includes('infinite recursion')) {
          throw new Error('Permission denied: ' + error.message);
        }
        
        throw error;
      }
      
      if (!data) {
        console.log("No profile found for user");
        return null;
      }
      
      // Get user email from auth if not in profile
      const { data: user } = await supabase.auth.getUser();
      
      const profile: UserProfile = {
        id: data.id,
        full_name: data.full_name,
        email: user.user?.email || data.email || null,
        role: data.role || 'org_owner',
        org_id: data.org_id,
        trial_ends_at: data.trial_ends_at,
        created_at: data.created_at || new Date().toISOString()
      };
      
      console.log("Profile fetched successfully:", {
        id: profile.id,
        role: profile.role,
        org_id: profile.org_id,
        has_email: !!profile.email
      });
      
      return profile;
    } catch (error) {
      console.error(`Error in fetchUserProfile (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for non-permission errors
      if (retryCount < maxRetries && !error.message.includes('Permission denied')) {
        console.log(`Retrying profile fetch in ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return profileService.fetchUserProfile(userId, retryCount + 1);
      }
      
      // After all retries failed or permission denied
      console.error('Failed to fetch profile after all retries');
      return null;
    }
  },

  checkRoleAccess(userProfile: UserProfile | null, allowedRoles: string[]): boolean {
    if (!userProfile) return false;
    
    // Always grant access to system admins
    if (userProfile.role === 'system_admin') return true;
    
    return allowedRoles.includes(userProfile.role);
  }
};
