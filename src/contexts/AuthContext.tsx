
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { profileService } from "./auth/profileService";
import { organizationService } from "./auth/organizationService";
import { roleService } from "./auth/roleService";
import { UserProfile } from "./auth/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: string | null;
  permissions: ReturnType<typeof roleService.getPermissionsForRole>;
  tier: string;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullName?: string,
    role?: string,
    companyName?: string
  ) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  repairProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  checkRoleAccess: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  sendInvitation: (email: string, role: string) => Promise<boolean>;
  getInvitations: () => Promise<any[]>;
  acceptInvitation: (token: string) => Promise<boolean>;
  createOrganization: (orgName: string) => Promise<boolean>;
  organization: any | null;
  setTier: (tier: string) => void;
}

const initialPermissions = roleService.getDefaultPermissions();
const initialContext: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  role: null,
  permissions: initialPermissions,
  tier: "basic",
  loading: true,
  isLoading: true,
  error: null,
  login: async () => false,
  logout: async () => {},
  signup: async () => false,
  refreshProfile: async () => {},
  repairProfile: async () => {},
  updateProfile: async () => {},
  checkRoleAccess: () => false,
  hasPermission: () => false,
  sendInvitation: async () => false,
  getInvitations: async () => [],
  acceptInvitation: async () => false,
  createOrganization: async () => false,
  organization: null,
  setTier: () => {},
};

const AuthContext = createContext<AuthContextType>(initialContext);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [tier, setTier] = useState<string>("basic");
  const [permissions, setPermissions] = useState(initialPermissions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simplified profile fetching with better error handling
  const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      console.log('[AuthContext] Fetching profile for user:', uid);
      setError(null);
      
      // Try to fetch profile directly first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (profileError) {
        console.error('[AuthContext] Profile fetch error:', profileError);
        
        // If profile doesn't exist, try to create it
        if (profileError.code === 'PGRST116') {
          console.log('[AuthContext] Profile not found, attempting to create one');
          
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: uid,
                email: userData.user.email,
                full_name: userData.user.user_metadata?.full_name || 'User',
                role: 'org_owner',
                created_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error('[AuthContext] Failed to create profile:', insertError);
              setError('Failed to create user profile');
              return null;
            }
            
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', uid)
              .single();
            
            if (newProfile) {
              setProfile(newProfile);
              setRole(newProfile.role);
              setPermissions(roleService.getPermissionsForRole(newProfile.role as any));
              return newProfile;
            }
          }
        }
        
        setError('Failed to load profile');
        return null;
      }

      if (profileData) {
        console.log('[AuthContext] Profile loaded successfully:', profileData);
        setProfile(profileData);
        setRole(profileData.role);
        setPermissions(roleService.getPermissionsForRole(profileData.role as any));
        
        // Load organization if exists
        if (profileData.org_id) {
          const org = await organizationService.loadOrganization(profileData.org_id);
          setOrganization(org);
        }
        
        return profileData;
      }

      return null;
    } catch (err: any) {
      console.error('[AuthContext] Unexpected error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
      return null;
    }
  }, []);

  // Simplified auth state management
  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('[AuthContext] Auth state change:', event, !!session);
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        setLoading(true);
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          setLoading(false);
        }
      } else {
        // Clear state on logout
        setProfile(null);
        setRole(null);
        setPermissions(initialPermissions);
        setOrganization(null);
        setError(null);
        setLoading(false);
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting initial session:', error);
          setError('Failed to get session');
        }
        
        if (mounted) {
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (err) {
        console.error('[AuthContext] Error in initial session load:', err);
        if (mounted) {
          setError('Failed to initialize session');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[AuthContext] Auth initialization timeout');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile, loading]);

  // Simplified login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Attempting login for:', email);
      setError(null);
      setLoading(true);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('[AuthContext] Login error:', authError);
        setError(authError.message);
        setLoading(false);
        return false;
      }
      
      if (data.session && data.user) {
        console.log('[AuthContext] Login successful');
        // Auth state change will handle profile loading
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (err: any) {
      console.error('[AuthContext] Unexpected login error:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  // Simplified signup
  const signup = async (
    email: string,
    password: string,
    fullName?: string,
    role: string = "org_owner",
    companyName?: string
  ): Promise<boolean> => {
    try {
      console.log('[AuthContext] Attempting signup for:', email);
      setError(null);
      setLoading(true);
      
      const redirectUrl = `${window.location.origin}/login`;
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role,
            company_name: companyName,
          }
        },
      });
      
      if (signUpError) {
        console.error('[AuthContext] Signup error:', signUpError);
        setError(signUpError.message);
        setLoading(false);
        return false;
      }

      if (data.user) {
        console.log('[AuthContext] Signup successful');
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (err: any) {
      console.error('[AuthContext] Unexpected signup error:', err);
      setError(err.message || 'Signup failed');
      setLoading(false);
      return false;
    }
  };

  // Simple logout
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // Auth state change will handle cleanup
  };

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const repairProfile = useCallback(async () => {
    setError(null);
    await refreshProfile();
  }, [refreshProfile]);

  // Profile update
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      
      if (error) {
        setError(error.message);
      } else {
        await refreshProfile();
      }
    } catch (err: any) {
      setError(err.message || 'Update failed');
    }
  };

  // Role and permission checks
  const checkRoleAccess = useCallback(
    (roles: string[]) => roleService.checkRoleAccess(role, roles),
    [role]
  );
  
  const hasPermission = useCallback(
    (perm: string) => roleService.hasPermission(permissions, perm),
    [permissions]
  );

  // Organization creation
  const createOrganization = async (orgName: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const org = await organizationService.createOrganization(orgName, user.id);
      await organizationService.linkProfileToOrganization(org.id, user.id);
      
      setOrganization(org);
      await refreshProfile();
      
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('[AuthContext] Organization creation failed:', err);
      setError(err.message || 'Failed to create organization');
      setLoading(false);
      return false;
    }
  };

  // Stub implementations for team features
  const sendInvitation = async () => false;
  const getInvitations = async () => [];
  const acceptInvitation = async () => false;

  const contextValue: AuthContextType = {
    session,
    user,
    profile,
    role,
    permissions,
    tier,
    loading,
    isLoading: loading,
    error,
    login,
    logout,
    signup,
    refreshProfile,
    repairProfile,
    updateProfile,
    checkRoleAccess,
    hasPermission,
    createOrganization,
    sendInvitation,
    getInvitations,
    acceptInvitation,
    organization,
    setTier,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthContextProvider");
  return context;
};

export { AuthContextProvider as AuthProvider };
export default AuthContextProvider;
