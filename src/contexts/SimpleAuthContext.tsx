import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../integrations/supabase/client";
import { simpleAuthService } from "./auth/simpleAuthService";
import { simpleProfileService } from "./auth/simpleProfileService";
import { roleService } from "./auth/roleService";
import { UserProfile } from "./auth/types";
import { runAuthHealthCheck, logHealthCheckResult } from "../utils/authHealthCheck";

interface SimpleAuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Auth methods
  signUp: (email: string, password: string, fullName: string, role?: string, companyName?: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  
  // Profile methods
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  
  // Organization methods
  createOrganization: (orgName: string) => Promise<boolean>;
  
  // Role/Permission methods
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isSystemAdmin: () => boolean;
  
  // Debug
  debugAuth: () => Promise<any>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | null>(null);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Auth methods
  const signUp = async (email: string, password: string, fullName: string, role: string = 'org_owner', companyName?: string): Promise<boolean> => {
    try {
      setError(null);
      const data = await simpleAuthService.signUp(email, password, fullName, role, companyName);
      return !!data.user;
    } catch (err: any) {
      console.error('[SimpleAuthContext] Sign up error:', err);
      setError(err.message);
      return false;
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const data = await simpleAuthService.signIn(email, password);
      return !!data.user;
    } catch (err: any) {
      console.error('[SimpleAuthContext] Sign in error:', err);
      setError(err.message);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await simpleAuthService.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (err: any) {
      console.error('[SimpleAuthContext] Sign out error:', err);
      setError(err.message);
    }
  };

  // Profile fetching with deduplication
  const fetchProfile = useCallback(async (userId: string, currentRetry: number = 0) => {
    if (!userId || fetchingProfile) {
      console.log('[SimpleAuthContext] Skipping profile fetch - no userId or already fetching');
      return;
    }

    const MAX_RETRIES = 3;
    setFetchingProfile(true);
    
    try {
      console.log(`[SimpleAuthContext] Fetching profile for user: ${userId} retry: ${currentRetry}`);
      const profileData = await simpleProfileService.fetchProfile(userId);
      
      if (profileData) {
        console.log('[SimpleAuthContext] Profile loaded:', profileData);
        setProfile(profileData);
        setError(null);
        setRetryCount(0);
      } else {
        console.warn('[SimpleAuthContext] No profile data returned');
        if (currentRetry < MAX_RETRIES) {
          setRetryCount(currentRetry + 1);
          setTimeout(() => fetchProfile(userId, currentRetry + 1), 1000 * (currentRetry + 1));
        } else {
          setError('Failed to load profile after multiple attempts');
        }
      }
    } catch (err: any) {
      console.error('[SimpleAuthContext] Profile fetch error:', err);
      if (currentRetry < MAX_RETRIES) {
        setRetryCount(currentRetry + 1);
        setTimeout(() => fetchProfile(userId, currentRetry + 1), 1000 * (currentRetry + 1));
      } else {
        setError(`Profile loading failed: ${err.message}`);
      }
    } finally {
      setFetchingProfile(false);
    }
  }, [fetchingProfile]);

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const updatedProfile = await simpleProfileService.updateProfile(user.id, updates);
      if (updatedProfile) {
        await fetchProfile(user.id);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('[SimpleAuthContext] Profile update error:', err);
      setError(err.message);
      return false;
    }
  };

  // Organization creation method
  const createOrganization = async (orgName: string): Promise<boolean> => {
    try {
      console.log('[SimpleAuthContext] Creating organization:', orgName);
      
      const { data, error } = await supabase.rpc('create_user_organization', {
        org_name: orgName
      });

      if (error) {
        console.error('[SimpleAuthContext] Organization creation error:', error);
        setError(error.message);
        return false;
      }

      // Type guard for the response data
      const response = data as any;
      if (!response?.success) {
        console.error('[SimpleAuthContext] Organization creation failed:', response?.error);
        setError(response?.error || 'Failed to create organization');
        return false;
      }

      console.log('[SimpleAuthContext] Organization created successfully:', response.org_id);
      
      // Refresh profile to get updated organization info
      if (user) {
        await fetchProfile(user.id);
      }
      
      return true;
    } catch (err: any) {
      console.error('[SimpleAuthContext] Organization creation exception:', err);
      setError(err.message || 'Failed to create organization');
      return false;
    }
  };

  // Role/Permission methods
  const hasRole = (role: string): boolean => {
    return profile?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    const permissions = roleService.getPermissionsForRole(profile.role);
    return roleService.hasPermission(permissions, permission);
  };

  const isSystemAdmin = (): boolean => {
    return profile?.role === 'system_admin';
  };

  // Debug method with health check
  const debugAuth = async (): Promise<any> => {
    try {
      const [debugInfo, healthCheck] = await Promise.all([
        simpleProfileService.debugAuthStatus(user?.id),
        runAuthHealthCheck()
      ]);
      
      logHealthCheckResult(healthCheck);
      
      return {
        session: !!session,
        user: !!user,
        profile: !!profile,
        loading,
        error,
        debugInfo,
        healthCheck
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Debug failed' };
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('[SimpleAuthContext] Setting up auth listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[SimpleAuthContext] Auth state changed:', event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user && !fetchingProfile) {
          // Defer profile fetch to avoid blocking auth state change
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else if (!currentSession?.user) {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('[SimpleAuthContext] Initial session check:', initialSession?.user?.id);
      setSession(initialSession);
      setUser(initialSession?.user || null);
      
      if (initialSession?.user && !fetchingProfile) {
        setTimeout(() => {
          fetchProfile(initialSession.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const contextValue: SimpleAuthContextType = {
    session,
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    updateProfile,
    createOrganization,
    hasRole,
    hasPermission,
    isSystemAdmin,
    debugAuth,
  };

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider");
  }
  return context;
};