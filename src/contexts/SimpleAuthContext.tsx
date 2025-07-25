
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

export const SimpleAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState<string | null>(null);

  // Helper: Fetch profile for user with retry logic
  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    // Prevent duplicate fetches for the same user
    if (fetchingProfile === userId) {
      console.log('[SimpleAuthContext] Already fetching profile for user:', userId);
      return;
    }
    
    console.log('[SimpleAuthContext] Fetching profile for user:', userId, 'retry:', retryCount);
    setFetchingProfile(userId);
    
    try {
      const profileData = await simpleProfileService.fetchProfile(userId);
      
      if (profileData) {
        setProfile(profileData);
        setError(null);
        console.log('[SimpleAuthContext] Profile loaded:', profileData);
      } else {
        setProfile(null);
        setError("Profile not found. Please contact support.");
        console.warn('[SimpleAuthContext] No profile found for user:', userId);
      }
    } catch (err: any) {
      console.error('[SimpleAuthContext] Error fetching profile:', err);
      
      // Check for specific RLS recursion error and retry
      if (err?.code === '42P17' && retryCount < 3) {
        console.log('[SimpleAuthContext] RLS recursion detected, retrying in 1s...');
        setTimeout(() => fetchProfile(userId, retryCount + 1), 1000);
        return;
      }
      
      setProfile(null);
      const errorMessage = err?.code === '42P17' 
        ? "Database configuration issue. Please contact support."
        : "Failed to load profile. Please try refreshing.";
      setError(errorMessage);
    } finally {
      setFetchingProfile(null);
    }
  }, [fetchingProfile]);

  // Auth state change handler
  useEffect(() => {
    console.log('[SimpleAuthContext] Setting up auth listener');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[SimpleAuthContext] Auth state changed:', event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Fetch profile with slight delay to allow trigger to complete
        setTimeout(() => fetchProfile(session.user.id), 100);
      } else {
        setProfile(null);
        setError(null);
      }
      
      setLoading(false);
    });

    // Get initial session
    simpleAuthService.getCurrentSession().then((session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log('[SimpleAuthContext] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []); // Remove fetchProfile dependency to prevent re-renders

  // Sign up method
  const signUp = async (email: string, password: string, fullName: string, role: string = 'org_owner', companyName?: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      await simpleAuthService.signUp(email, password, fullName, role, companyName);
      return true;
    } catch (err: any) {
      console.error('[SimpleAuthContext] Signup error:', err);
      setError(err.message || 'Signup failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign in method
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      await simpleAuthService.signIn(email, password);
      return true;
    } catch (err: any) {
      console.error('[SimpleAuthContext] Signin error:', err);
      setError(err.message || 'Sign in failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out method
  const signOut = async (): Promise<void> => {
    setLoading(true);
    
    try {
      await simpleAuthService.signOut();
      // State will be cleared by auth state change listener
    } catch (err: any) {
      console.error('[SimpleAuthContext] Signout error:', err);
      setError(err.message || 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  // Refresh profile
  const refreshProfile = async (): Promise<void> => {
    if (user) {
      setLoading(true);
      await fetchProfile(user.id);
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    
    try {
      const updatedProfile = await simpleProfileService.updateProfile(user.id, updates);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        setError(null);
        return true;
      }
      
      setError('Failed to update profile');
      return false;
    } catch (err: any) {
      console.error('[SimpleAuthContext] Profile update error:', err);
      setError(err.message || 'Profile update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Role and permission helpers
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
    hasRole,
    createOrganization,
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
