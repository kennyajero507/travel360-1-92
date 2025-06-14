
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    console.log(`[ProfileService] Fetching profile for user: ${userId}`);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[ProfileService] Error fetching user profile:', error.message);
        return null;
      }

      if (!data) {
        console.log('[ProfileService] No profile found for user:', userId);
        return null;
      }

      console.log("[ProfileService] Profile fetched successfully:", data);
      return data as UserProfile;
    } catch (err) {
      console.error('[ProfileService] Unexpected error:', err);
      return null;
    }
  },
};
