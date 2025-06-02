
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const profileService = {
  async fetchUserProfile(userId: string, retryCount = 0): Promise<UserProfile | null> {
    const maxRetries = 3;
    const timeout = 10000; // Increased to 10 seconds
    
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
        console.log("No profile found for user, creating one automatically");
        
        // Get user info for creating profile
        const { data: user } = await supabase.auth.getUser();
        const userEmail = user.user?.email;
        const fullName = user.user?.user_metadata?.full_name || userEmail?.split('@')[0] || 'User';
        
        // Create a new profile automatically
        const newProfile = {
          id: userId,
          full_name: fullName,
          email: userEmail,
          role: 'org_owner', // Default role for new users
          org_id: null,
          trial_ends_at: null
        };
        
        console.log("Creating new profile:", newProfile);
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          // Return fallback profile if creation fails
          return {
            id: userId,
            full_name: fullName,
            email: userEmail || null,
            role: 'org_owner',
            org_id: null,
            trial_ends_at: null,
            created_at: new Date().toISOString()
          };
        }
        
        return {
          id: createdProfile.id,
          full_name: createdProfile.full_name,
          email: createdProfile.email,
          role: createdProfile.role,
          org_id: createdProfile.org_id,
          trial_ends_at: createdProfile.trial_ends_at,
          created_at: createdProfile.created_at || new Date().toISOString()
        };
      }
      
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
        full_name: user.user?.user_metadata?.full_name || user.user?.email?.split('@')[0] || 'User',
        email: user.user?.email || null,
        role: 'org_owner',
        org_id: null,
        trial_ends_at: null,
        created_at: new Date().toISOString()
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
