
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const simpleProfileService = {
  async fetchProfile(userId: string): Promise<UserProfile | null> {
    console.log('[SimpleProfileService] Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[SimpleProfileService] Error fetching profile:', error);
      
      // Handle specific RLS recursion error
      if (error.code === '42P17') {
        console.error('[SimpleProfileService] RLS infinite recursion detected - this should be fixed now');
      }
      
      throw error;
    }

    if (data) {
      console.log('[SimpleProfileService] Profile found:', data);
      // Ensure all required fields are present with defaults
      const profile: UserProfile = {
        id: data.id,
        full_name: data.full_name || null,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role || 'org_owner',
        org_id: data.org_id || null,
        created_at: data.created_at || new Date().toISOString(),
        trial_ends_at: data.trial_ends_at || null,
        currency: data.currency || 'USD',
        email_notifications: data.email_notifications !== undefined ? data.email_notifications : true,
        sms_notifications: data.sms_notifications !== undefined ? data.sms_notifications : false,
      };
      return profile;
    }

    console.log('[SimpleProfileService] No profile found for user:', userId);
    return null;
  },

  async createProfile(userId: string, email: string, fullName: string, role: string = 'org_owner'): Promise<UserProfile | null> {
    console.log('[SimpleProfileService] Creating profile for user:', userId);
    
    const profileData = {
      id: userId,
      full_name: fullName,
      email: email,
      role: role,
      created_at: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'USD',
      email_notifications: true,
      sms_notifications: false,
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error('[SimpleProfileService] Error creating profile:', error);
      return null;
    }

    console.log('[SimpleProfileService] Profile created successfully:', data);
    return this.normalizeProfile(data);
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    console.log('[SimpleProfileService] Updating profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[SimpleProfileService] Error updating profile:', error);
      return null;
    }

    console.log('[SimpleProfileService] Profile updated successfully:', data);
    return this.normalizeProfile(data);
  },

  async isSystemAdmin(userId?: string): Promise<boolean> {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return false;

    const { data } = await supabase
      .from('system_admins')
      .select('id')
      .eq('user_id', targetUserId)
      .maybeSingle();

    return !!data;
  },

  async debugAuthStatus(userId?: string): Promise<any> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) {
        return { error: 'No user ID available' };
      }

      const { data, error } = await supabase.rpc('debug_auth_status', {
        target_user_id: targetUserId
      });

      if (error) {
        console.error('[SimpleProfileService] Debug function error:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('[SimpleProfileService] Debug error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Helper method to normalize profile data
  normalizeProfile(data: any): UserProfile {
    return {
      id: data.id,
      full_name: data.full_name || null,
      email: data.email || null,
      phone: data.phone || null,
      role: data.role || 'org_owner',
      org_id: data.org_id || null,
      created_at: data.created_at || new Date().toISOString(),
      trial_ends_at: data.trial_ends_at || null,
      currency: data.currency || 'USD',
      email_notifications: data.email_notifications !== undefined ? data.email_notifications : true,
      sms_notifications: data.sms_notifications !== undefined ? data.sms_notifications : false,
    };
  }
};
