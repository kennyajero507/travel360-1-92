
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';
import { toast } from 'sonner';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log(`[ProfileService] Fetching profile for user: ${userId}`);
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // Log forbidden error explicitly
        if (error.code === '42501' || error.status === 401 || error.status === 403) {
          console.error('[ProfileService] RLS Forbidden: Cannot access profile. This is likely a policy or database access error.', error);
          return { __forbidden: true } as any;
        }
        console.error('[ProfileService] Error fetching user profile:', error);
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
        created_at: data.created_at || new Date().toISOString()
      };

      console.log("[ProfileService] Profile fetched successfully:", {
        id: profile.id,
        role: profile.role,
        org_id: profile.org_id,
        has_email: !!profile.email
      });

      return profile;
    } catch (error: any) {
      // Log forbidden error explicitly
      if (error?.code === '42501' || error?.status === 401 || error?.status === 403) {
        console.error('[ProfileService] RLS Forbidden: Cannot access profile. (CATCH BLOCK)');
        return { __forbidden: true } as any;
      }
      console.error(`[ProfileService] Error in fetchUserProfile:`, error);
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

  checkRoleAccess(userProfile: UserProfile | null, allowedRoles: string[]): boolean {
    if (!userProfile) return false;
    if (userProfile.role === 'system_admin') return true;
    return allowedRoles.includes(userProfile.role);
  }
};
