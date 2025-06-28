
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    console.log('[ProfileService] Fetching profile for user:', userId);
    
    try {
      // Simple direct query without complex error handling
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[ProfileService] Database error:', error);
        return null;
      }

      if (data) {
        console.log('[ProfileService] Profile found:', data);
        return data as UserProfile;
      }

      console.warn('[ProfileService] No profile found for user:', userId);
      return null;
    } catch (err) {
      console.error('[ProfileService] Unexpected error:', err);
      return null;
    }
  },

  async repairUserProfile(userId: string): Promise<UserProfile | null> {
    console.log('[ProfileService] Attempting to repair profile for user:', userId);
    
    try {
      // Get current user from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user || user.id !== userId) {
        console.error('[ProfileService] Cannot repair - auth user mismatch');
        return null;
      }

      // Create profile data
      const profileData = {
        id: userId,
        full_name: user.user_metadata?.full_name || 
                   user.user_metadata?.name || 
                   user.email?.split('@')[0] || 
                   'User',
        email: user.email,
        role: user.user_metadata?.role || 'org_owner',
        created_at: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      };

      console.log('[ProfileService] Creating profile with data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('[ProfileService] Profile repair failed:', error);
        
        // Check for existing profile conflict
        if (error.code === '23505') {
          console.log('[ProfileService] Profile already exists, fetching...');
          return await this.fetchUserProfile(userId);
        }
        
        return null;
      }

      console.log('[ProfileService] Profile repaired successfully:', data);
      return data as UserProfile;
    } catch (err) {
      console.error('[ProfileService] Profile repair error:', err);
      return null;
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      console.log('[ProfileService] Performing health check...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[ProfileService] Health check: No authenticated user');
        return false;
      }

      // Test database connectivity with simple query
      const { error } = await supabase.rpc('health_check_profiles');

      if (error) {
        console.error('[ProfileService] Health check failed:', error);
        return false;
      }

      console.log('[ProfileService] Health check passed');
      return true;
    } catch (error) {
      console.error('[ProfileService] Health check error:', error);
      return false;
    }
  },

  async debugProfile(userId?: string): Promise<any> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) {
        return { error: 'No user ID available' };
      }

      const { data, error } = await supabase.rpc('debug_user_profile', {
        target_user_id: targetUserId
      });

      if (error) {
        console.error('[ProfileService] Debug function error:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('[ProfileService] Debug error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};
