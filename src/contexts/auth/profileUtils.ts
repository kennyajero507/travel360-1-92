
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';
import { organizationService } from './organizationService';

export const profileUtils = {
  async fetchWithRetry(userId: string, maxRetries = 3): Promise<UserProfile | null> {
    const retryDelays = [1000, 2000, 3000];
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[ProfileUtils] Fetching profile for user: ${userId} (attempt ${attempt + 1})`);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('[ProfileUtils] Profile fetch error:', profileError);
          
          if (profileError.code === 'PGRST116' && attempt < maxRetries) {
            console.log(`[ProfileUtils] Profile not found, retrying in ${retryDelays[attempt]}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
            continue;
          }
          
          if (profileError.code === 'PGRST116') {
            console.log('[ProfileUtils] Creating profile manually after retries failed');
            return await this.createManually(userId);
          }
          
          throw new Error('Failed to load profile');
        }

        if (profileData) {
          console.log('[ProfileUtils] Profile loaded successfully:', profileData);
          return profileData;
        }

        if (attempt < maxRetries) {
          console.log(`[ProfileUtils] No profile data, retrying in ${retryDelays[attempt]}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
          continue;
        }

        return await this.createManually(userId);
      } catch (err: any) {
        console.error('[ProfileUtils] Error fetching profile:', err);
        
        if (attempt < maxRetries) {
          console.log(`[ProfileUtils] Retrying due to error in ${retryDelays[attempt]}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
          continue;
        }
        
        throw err;
      }
    }
    
    return null;
  },

  async createManually(userId: string): Promise<UserProfile | null> {
    try {
      console.log('[ProfileUtils] Creating profile manually for user:', userId);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const profileData = {
        id: userId,
        email: userData.user.email,
        full_name: userData.user.user_metadata?.full_name || 'User',
        role: 'org_owner',
        created_at: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('[ProfileUtils] Failed to create profile manually:', error);
        throw new Error('Failed to create user profile');
      }

      console.log('[ProfileUtils] Profile created manually:', data);
      return data;
    } catch (error: any) {
      console.error('[ProfileUtils] Error in manual profile creation:', error);
      throw new Error('Failed to create profile');
    }
  },

  async loadOrganizationSafely(orgId: string | null): Promise<any | null> {
    if (!orgId) {
      console.log('[ProfileUtils] No organization ID provided');
      return null;
    }

    try {
      console.log('[ProfileUtils] Loading organization:', orgId);
      
      // Add timeout protection for organization loading
      const orgLoadPromise = organizationService.loadOrganization(orgId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Organization loading timeout')), 8000)
      );
      
      const org = await Promise.race([orgLoadPromise, timeoutPromise]);
      console.log('[ProfileUtils] Organization loaded:', org);
      return org;
    } catch (orgError: any) {
      console.warn('[ProfileUtils] Organization loading failed, but continuing:', orgError.message);
      // Don't fail the entire auth process if organization loading fails
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId);
    
    if (error) {
      throw new Error(error.message);
    }
  }
};
