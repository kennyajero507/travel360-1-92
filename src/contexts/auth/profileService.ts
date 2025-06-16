
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('[ProfileService] Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[ProfileService] Error fetching profile:', error);
        
        // If no profile exists, try to repair it
        if (error.code === 'PGRST116') {
          console.log('[ProfileService] No profile found, attempting to repair...');
          return await this.repairUserProfile(userId);
        }
        
        throw error;
      }

      if (!data) {
        console.log('[ProfileService] No profile data, attempting to repair...');
        return await this.repairUserProfile(userId);
      }

      console.log('[ProfileService] Profile fetched successfully:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('[ProfileService] Error in fetchUserProfile:', error);
      return null;
    }
  },

  async repairUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('[ProfileService] Attempting to repair profile for user:', userId);
      
      // Get user data from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user || user.id !== userId) {
        console.error('[ProfileService] Cannot repair profile - no authenticated user');
        return null;
      }

      // Create a basic profile
      const profileData = {
        id: userId,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        role: user.user_metadata?.role || 'org_owner',
        created_at: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('[ProfileService] Error repairing profile:', error);
        return null;
      }

      console.log('[ProfileService] Profile repaired successfully:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('[ProfileService] Error in repairUserProfile:', error);
      return null;
    }
  }
};
