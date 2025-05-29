
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const profileService = {
  async fetchUserProfile(userId: string, retryCount = 0): Promise<UserProfile | null> {
    const maxRetries = 3;
    const timeout = 5000; // 5 seconds
    
    try {
      console.log(`Fetching user profile for ID: ${userId} (attempt ${retryCount + 1})`);
      
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
        throw error;
      }
      
      if (!data) {
        console.log("No profile found for user, creating fallback profile");
        // Get user info for fallback
        const { data: user } = await supabase.auth.getUser();
        return {
          id: userId,
          email: user.user?.email || '',
          role: 'agent',
          full_name: user.user?.user_metadata?.full_name || null,
        };
      }
      
      const { data: user } = await supabase.auth.getUser();
      const profile: UserProfile = {
        id: data.id,
        email: user.user?.email || '',
        role: data.role || 'agent',
        full_name: data.full_name,
        org_id: data.org_id,
        trial_ends_at: data.trial_ends_at
      };
      
      console.log("User profile fetched successfully:", {
        id: profile.id,
        role: profile.role,
        org_id: profile.org_id
      });
      
      return profile;
    } catch (error) {
      console.error(`Error in fetchUserProfile (attempt ${retryCount + 1}):`, error);
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying profile fetch in ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return profileService.fetchUserProfile(userId, retryCount + 1);
      }
      
      // If all retries failed, create a fallback profile
      console.log("All retries failed, creating fallback profile");
      const { data: user } = await supabase.auth.getUser();
      return {
        id: userId,
        email: user.user?.email || '',
        role: 'agent',
        full_name: user.user?.user_metadata?.full_name || null,
      };
    }
  },

  checkRoleAccess(userProfile: UserProfile | null, allowedRoles: string[]): boolean {
    if (!userProfile) return false;
    
    // Always grant access to system admins
    if (userProfile.role === 'system_admin') return true;
    
    return allowedRoles.includes(userProfile.role);
  }
};
