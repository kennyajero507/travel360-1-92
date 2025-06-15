
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const profileService = {
  // Retry-aware profile fetch with improved error surfacing
  async fetchUserProfile(userId: string, maxRetries = 2): Promise<UserProfile | null> {
    let lastError: any = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          lastError = error;
          console.error(`[ProfileService] Error fetching user profile (attempt ${attempt + 1}):`, error.message);
          if (error.code === 'PGRST116' /* Not found */) continue;
        }

        if (!data) {
          lastError = '[ProfileService] No profile found';
          continue;
        }

        return data as UserProfile;
      } catch (err) {
        lastError = err;
        console.error(`[ProfileService] Unexpected error fetching profile (attempt ${attempt + 1}):`, err);
      }
      // Exponential backoff
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
    // All retries failed
    if (lastError) console.error('[ProfileService] Profile fetch ultimately failed:', lastError);
    return null;
  },
};
