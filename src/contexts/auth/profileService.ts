
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    console.log(`[ProfileService] Fetching profile for user: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[ProfileService] Error fetching user profile:', error.message);
      // Return null and let the AuthContext handle it. No more fallback profiles.
      return null;
    }

    console.log("[ProfileService] Profile fetched successfully:", data);
    return data as UserProfile;
  },
};
