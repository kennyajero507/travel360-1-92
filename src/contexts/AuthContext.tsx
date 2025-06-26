
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { authService } from "./auth/authService";
import { profileUtils } from "./auth/profileUtils";
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

  // Enhanced profile fetching
  const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      console.log(`[AuthContext] Starting profile fetch for user: ${uid}`);
      setError(null);
      
      const profileData = await profileUtils.fetchWithRetry(uid);
      if (!profileData) {
        setError('Failed to load profile');
        return null;
      }

      console.log('[AuthContext] Profile loaded, setting state');
      setProfile(profileData);
      setRole(profileData.role);
      setPermissions(roleService.getPermissionsForRole(profileData.role as any));
      
      // Load organization safely - don't let this block the profile loading
      if (profileData.org_id) {
        // Use setTimeout to prevent blocking the profile setup
        setTimeout(async () => {
          try {
            const org = await profileUtils.loadOrganizationSafely(profileData.org_id);
            setOrganization(org);
          } catch (orgError) {
            console.warn('[AuthContext] Organization loading failed:', orgError);
            setOrganization(null);
          }
        }, 100);
      } else {
        setOrganization(null);
      }
      
      return profileData;
    } catch (err: any) {
      console.error('[AuthContext] Profile fetch failed:', err);
      setError(err.message || 'Failed to load profile');
      return null;
    }
  }, []);

  // Auth state management
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('[AuthContext] Auth state change:', event, !!session);
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        console.log('[AuthContext] Starting profile setup...');
        setLoading(true);
        
        try {
          await fetchProfile(session.user.id);
        } catch (error) {
          console.error('[AuthContext] Profile setup failed:', error);
        } finally {
          if (mounted) {
            console.log('[AuthContext] Profile setup completed, stopping loading');
            setLoading(false);
          }
        }
      } else {
        // Clear state on logout
        console.log('[AuthContext] Clearing auth state');
        setProfile(null);
        setRole(null);
        setPermissions(initialPermissions);
        setOrganization(null);
        setError(null);
        setLoading(false);
      }
    };

    // Set up auth listener
    const { data: { subscription } } = authService.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Getting initial session...');
        const session = await authService.getSession();
        
        if (mounted) {
          console.log('[AuthContext] Initial session:', !!session);
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

    // Timeout protection - more aggressive timeout
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[AuthContext] Auth initialization timeout - forcing stop loading');
        setLoading(false);
        if (!session && !profile) {
          setError('Authentication initialization timeout - please refresh the page');
        }
      }
    }, 10000); // Reduced to 10 seconds

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Enhanced login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      
      const data = await authService.signIn(email, password);
      
      if (data.session && data.user) {
        console.log('[AuthContext] Login successful');
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced signup
  const signup = async (
    email: string,
    password: string,
    fullName?: string,
    role: string = "org_owner",
    companyName?: string
  ): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      
      const data = await authService.signUp(email, password, {
        fullName,
        role,
        companyName
      });

      if (data.user) {
        console.log('[AuthContext] Signup successful');
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('[AuthContext] Signup error:', err);
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout
  const logout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      // Force cleanup even if signOut fails
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      setPermissions(initialPermissions);
      setOrganization(null);
      setError(null);
      setLoading(false);
    }
  };

  // Profile operations
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const repairProfile = useCallback(async () => {
    setError(null);
    if (user) {
      try {
        await profileUtils.createManually(user.id);
        await refreshProfile();
      } catch (error: any) {
        setError(error.message);
      }
    }
  }, [user, refreshProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      await profileUtils.updateProfile(user.id, updates);
      await refreshProfile();
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
      
      return true;
    } catch (err: any) {
      console.error('[AuthContext] Organization creation failed:', err);
      setError(err.message || 'Failed to create organization');
      return false;
    } finally {
      setLoading(false);
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
