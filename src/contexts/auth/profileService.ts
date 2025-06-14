import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';
import { toast } from 'sonner';

export const profileService = {
  async fetchUserProfile(userId: string, userEmail?: string): Promise<UserProfile | null> {
    try {
      console.log(`[ProfileService] Fetching profile for user: ${userId}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[ProfileService] Error fetching profile:', error);
        if (
          error.message.includes('row-level security') ||
          error.message.includes('permission denied')
        ) {
          console.log('[ProfileService] RLS blocking profile access, creating new profile');
          return await this.createNewProfile(userId, userEmail);
        }
        return await this.createFallbackProfile(userId, userEmail);
      }
      if (!data) {
        console.log("[ProfileService] No profile found - creating new profile");
        return await this.createNewProfile(userId, userEmail);
      }

      const profile: UserProfile = {
        id: data.id,
        full_name: data.full_name || (userEmail ? userEmail.split('@')[0] : 'User'),
        email: userEmail || data.email || "",
        role: data.role || 'org_owner',
        org_id: data.org_id,
        trial_ends_at: data.trial_ends_at,
        created_at: data.created_at || new Date().toISOString(),
        preferred_currency: data.preferred_currency || 'USD'
      };

      console.log("[ProfileService] Profile fetched successfully:", {
        id: profile.id, role: profile.role, org_id: profile.org_id, has_email: !!profile.email
      });

      return profile;
    } catch (error) {
      console.error('[ProfileService] Exception in fetchUserProfile:', error);
      return await this.createFallbackProfile(userId, userEmail);
    }
  },

  async createNewProfile(userId: string, userEmail?: string): Promise<UserProfile> {
    const safeEmail = userEmail || '';
    const profileData = {
      id: userId,
      full_name: safeEmail ? safeEmail.split('@')[0] : 'User',
      email: safeEmail,
      role: 'org_owner',
      preferred_currency: 'USD',
      created_at: new Date().toISOString()
    };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .maybeSingle();

      if (error) {
        console.error('[ProfileService] Error creating profile:', error);
        if (
          error.message.includes('row-level security') ||
          error.message.includes('permission denied')
        ) {
          console.log('[ProfileService] RLS prevented profile creation, using fallback');
        }
        return { ...profileData, org_id: null, trial_ends_at: null };
      }

      if (!data) {
        console.log('[ProfileService] No data returned from profile creation');
        return { ...profileData, org_id: null, trial_ends_at: null };
      }

      console.log('[ProfileService] Profile created successfully');
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
      console.error('[ProfileService] Exception in createNewProfile:', error);
      return this.createFallbackProfile(userId, safeEmail);
    }
  },

  async createFallbackProfile(userId: string, userEmail?: string): Promise<UserProfile> {
    const fallbackEmail = userEmail || '';
    return {
      id: userId,
      full_name: fallbackEmail ? fallbackEmail.split('@')[0] : 'User',
      email: fallbackEmail,
      role: 'org_owner',
      org_id: null,
      trial_ends_at: null,
      created_at: new Date().toISOString(),
      preferred_currency: 'USD'
    };
  },

  async ensureProfileExists(userId: string, userEmail?: string): Promise<UserProfile> {
    // Expose email to downstream consumers to prevent supabase.auth.getUser() recursion
    console.log(`[ProfileService] Ensuring profile exists for user: ${userId}`);
    return await this.fetchUserProfile(userId, userEmail);
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log('[ProfileService] Updating profile:', userId, updates);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('[ProfileService] Error updating profile:', error);
        toast.error('Failed to update profile');
        return null;
      }

      if (!data) {
        console.error('[ProfileService] No data returned from profile update');
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
