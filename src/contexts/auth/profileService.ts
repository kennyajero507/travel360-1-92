
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';
import { toast } from 'sonner';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log(`[ProfileService] Fetching profile for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('[ProfileService] Error fetching profile:', error);
        return await this.createFallbackProfile(userId);
      }
      
      if (!data) {
        console.log("[ProfileService] No profile found - creating new profile");
        return await this.createNewProfile(userId);
      }
      
      const { data: user } = await supabase.auth.getUser();
      
      const profile: UserProfile = {
        id: data.id,
        full_name: data.full_name || user.user?.email?.split('@')[0] || 'User',
        email: user.user?.email || data.email || '',
        role: data.role || 'org_owner',
        org_id: data.org_id,
        trial_ends_at: data.trial_ends_at,
        created_at: data.created_at || new Date().toISOString(),
        preferred_currency: data.preferred_currency || 'USD'
      };
      
      console.log("[ProfileService] Profile fetched successfully:", {
        id: profile.id,
        role: profile.role,
        org_id: profile.org_id,
        has_email: !!profile.email
      });
      
      return profile;
    } catch (error) {
      console.error('[ProfileService] Error in fetchUserProfile:', error);
      return await this.createFallbackProfile(userId);
    }
  },

  async createNewProfile(userId: string): Promise<UserProfile> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.email) {
        return this.createFallbackProfile(userId);
      }
      
      const profileData = {
        id: userId,
        full_name: user.user.email.split('@')[0] || 'User',
        email: user.user.email,
        role: 'org_owner',
        preferred_currency: 'USD',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) {
        console.error('[ProfileService] Error creating profile:', error);
        return {
          ...profileData,
          org_id: null,
          trial_ends_at: null
        };
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
      console.error('[ProfileService] Error creating new profile:', error);
      return this.createFallbackProfile(userId);
    }
  },

  async createFallbackProfile(userId: string): Promise<UserProfile> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      return {
        id: userId,
        full_name: user.user?.email?.split('@')[0] || 'User',
        email: user.user?.email || '',
        role: 'org_owner',
        org_id: null,
        trial_ends_at: null,
        created_at: new Date().toISOString(),
        preferred_currency: 'USD'
      };
    } catch (error) {
      console.error('[ProfileService] Error creating fallback profile:', error);
      
      return {
        id: userId,
        full_name: 'User',
        email: '',
        role: 'org_owner',
        org_id: null,
        trial_ends_at: null,
        created_at: new Date().toISOString(),
        preferred_currency: 'USD'
      };
    }
  },

  async ensureProfileExists(userId: string): Promise<UserProfile> {
    console.log(`[ProfileService] Ensuring profile exists for user: ${userId}`);
    return await this.fetchUserProfile(userId);
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log('[ProfileService] Updating profile:', userId, updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('[ProfileService] Error updating profile:', error);
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
