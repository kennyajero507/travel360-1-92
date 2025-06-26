
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './types';

export const workspaceService = {
  async initializeWorkspace(userId: string): Promise<{
    profile: UserProfile | null;
    organization: any | null;
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('[WorkspaceService] Initializing workspace for user:', userId);
      
      // Step 1: Fetch or create profile
      const profileResult = await this.ensureProfile(userId);
      if (!profileResult.success) {
        return { profile: null, organization: null, success: false, error: profileResult.error };
      }
      
      // Step 2: Load organization if profile has one
      let organization = null;
      if (profileResult.profile?.org_id) {
        const orgResult = await this.loadOrganization(profileResult.profile.org_id);
        organization = orgResult.organization;
        
        if (!orgResult.success) {
          console.warn('[WorkspaceService] Organization loading failed:', orgResult.error);
          // Don't fail workspace init if org loading fails
        }
      }
      
      console.log('[WorkspaceService] Workspace initialized successfully');
      return {
        profile: profileResult.profile,
        organization,
        success: true
      };
    } catch (error: any) {
      console.error('[WorkspaceService] Workspace initialization failed:', error);
      return {
        profile: null,
        organization: null,
        success: false,
        error: error.message
      };
    }
  },

  async ensureProfile(userId: string): Promise<{
    profile: UserProfile | null;
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('[WorkspaceService] Ensuring profile exists for user:', userId);
      
      // Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Profile fetch error: ${fetchError.message}`);
      }
      
      if (existingProfile) {
        console.log('[WorkspaceService] Profile found:', existingProfile);
        return { profile: existingProfile, success: true };
      }
      
      // Profile doesn't exist, create it
      console.log('[WorkspaceService] Profile not found, creating...');
      return await this.createProfile(userId);
    } catch (error: any) {
      console.error('[WorkspaceService] Profile ensure failed:', error);
      return { profile: null, success: false, error: error.message };
    }
  },

  async createProfile(userId: string): Promise<{
    profile: UserProfile | null;
    success: boolean;
    error?: string;
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || userData.user.id !== userId) {
        throw new Error('User mismatch or no authenticated user');
      }

      const user = userData.user;
      const profileData = {
        id: userId,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: user.user_metadata?.role || 'org_owner',
        created_at: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { data: createdProfile, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        throw new Error(`Profile creation failed: ${error.message}`);
      }

      console.log('[WorkspaceService] Profile created successfully:', createdProfile);
      return { profile: createdProfile, success: true };
    } catch (error: any) {
      console.error('[WorkspaceService] Profile creation failed:', error);
      return { profile: null, success: false, error: error.message };
    }
  },

  async loadOrganization(orgId: string): Promise<{
    organization: any | null;
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('[WorkspaceService] Loading organization:', orgId);
      
      const { data: org, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .maybeSingle();
      
      if (error) {
        throw new Error(`Organization fetch error: ${error.message}`);
      }
      
      if (!org) {
        throw new Error('Organization not found');
      }
      
      console.log('[WorkspaceService] Organization loaded:', org);
      return { organization: org, success: true };
    } catch (error: any) {
      console.error('[WorkspaceService] Organization loading failed:', error);
      return { organization: null, success: false, error: error.message };
    }
  },

  async debugAuth(userId?: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('debug_user_auth', {
        user_id_param: userId || null
      });
      
      if (error) {
        console.error('[WorkspaceService] Debug auth failed:', error);
        return { error: error.message };
      }
      
      return data;
    } catch (error: any) {
      console.error('[WorkspaceService] Debug auth error:', error);
      return { error: error.message };
    }
  },

  async checkSystemHealth(): Promise<{
    database: boolean;
    profile: boolean;
    organization: boolean;
    policies: boolean;
  }> {
    try {
      // Test database connection
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
      const database = !dbError;
      
      // Test profile access
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
        .maybeSingle();
      const profileAccess = !profileError;
      
      // Test organization access
      let organizationAccess = true;
      if (profile) {
        const { error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .limit(1);
        organizationAccess = !orgError;
      }
      
      return {
        database,
        profile: profileAccess,
        organization: organizationAccess,
        policies: database && profileAccess && organizationAccess
      };
    } catch (error) {
      console.error('[WorkspaceService] Health check failed:', error);
      return {
        database: false,
        profile: false,
        organization: false,
        policies: false
      };
    }
  }
};
