
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';
import { enhancedProfileService } from './enhancedProfileService';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    console.log('[ProfileService] Delegating to enhanced service for user:', userId);
    return await enhancedProfileService.fetchUserProfile(userId);
  },

  async repairUserProfile(userId: string): Promise<UserProfile | null> {
    console.log('[ProfileService] Delegating repair to enhanced service for user:', userId);
    return await enhancedProfileService.repairUserProfileWithRetry(userId);
  },

  async healthCheck(): Promise<boolean> {
    return await enhancedProfileService.healthCheck();
  },

  async debugProfile(userId?: string): Promise<any> {
    return await enhancedProfileService.debugUserProfile(userId);
  }
};
