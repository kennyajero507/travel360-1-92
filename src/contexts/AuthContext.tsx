
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { enhancedAuthService } from "./auth/enhancedAuthService";
import { workspaceService } from "./auth/workspaceService";
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
  initializing: boolean;
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
  isWorkspaceReady: boolean;
  debugAuth: () => Promise<any>;
  systemHealth: {
    database: boolean;
    profile: boolean;
    organization: boolean;
    policies: boolean;
  };
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
  initializing: true,
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
  isWorkspaceReady: false,
  debugAuth: async () => ({}),
  systemHealth: {
    database: false,
    profile: false,
    organization: false,
    policies: false
  },
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
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWorkspaceReady, setIsWorkspaceReady] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    database: false,
    profile: false,
    organization: false,
    policies: false
  });

  // Enhanced workspace initialization
  const initializeWorkspace = useCallback(async (userId: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Starting workspace initialization for user:', userId);
      setError(null);
      setLoading(true);
      
      const result = await workspaceService.initializeWorkspace(userId);
      
      if (result.success) {
        console.log('[AuthContext] Workspace initialized successfully');
        setProfile(result.profile);
        setOrganization(result.organization);
        setRole(result.profile?.role || null);
        setPermissions(roleService.getPermissionsForRole(result.profile?.role as any));
        setIsWorkspaceReady(true);
        
        // Update system health
        const health = await workspaceService.checkSystemHealth();
        setSystemHealth(health);
        
        return true;
      } else {
        console.error('[AuthContext] Workspace initialization failed:', result.error);
        setError(result.error || 'Failed to initialize workspace');
        return false;
      }
    } catch (err: any) {
      console.error('[AuthContext] Workspace initialization error:', err);
      setError(err.message || 'Workspace initialization failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth state management with timeout protection
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('[AuthContext] Auth state change:', event, !!session);
      
      // Always update session and user immediately
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        console.log('[AuthContext] User authenticated, initializing workspace...');
        
        // Use setTimeout to prevent blocking
        setTimeout(async () => {
          if (mounted) {
            const success = await initializeWorkspace(session.user.id);
            if (mounted) {
              setInitializing(false);
              if (!success) {
                console.warn('[AuthContext] Workspace initialization failed');
              }
            }
          }
        }, 0);
      } else {
        // Clear state on logout
        console.log('[AuthContext] Clearing auth state');
        setProfile(null);
        setRole(null);
        setPermissions(initialPermissions);
        setOrganization(null);
        setError(null);
        setLoading(false);
        setInitializing(false);
        setIsWorkspaceReady(false);
        setSystemHealth({ database: false, profile: false, organization: false, policies: false });
      }
    };

    // Set up auth listener first
    const { data: { subscription } } = enhancedAuthService.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Getting initial session...');
        const session = await enhancedAuthService.getSession();
        
        if (mounted) {
          console.log('[AuthContext] Initial session loaded:', !!session);
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (err) {
        console.error('[AuthContext] Error loading initial session:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    getInitialSession();

    // Initialization timeout - force completion after 15 seconds
    initTimeout = setTimeout(() => {
      if (mounted && initializing) {
        console.warn('[AuthContext] Initialization timeout - forcing completion');
        setInitializing(false);
        setLoading(false);
        if (!session && !profile) {
          setError('Authentication initialization timeout');
        }
      }
    }, 15000);

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [initializeWorkspace]);

  // Enhanced login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      
      const data = await enhancedAuthService.signIn(email, password);
      
      if (data.session && data.user) {
        console.log('[AuthContext] Login successful, waiting for workspace init');
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
      
      const data = await enhancedAuthService.signUp(email, password, {
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
      await enhancedAuthService.signOut();
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
      setInitializing(false);
      setIsWorkspaceReady(false);
    }
  };

  // Profile operations
  const refreshProfile = useCallback(async () => {
    if (user) {
      await initializeWorkspace(user.id);
    }
  }, [user, initializeWorkspace]);

  const repairProfile = useCallback(async () => {
    setError(null);
    if (user) {
      try {
        const result = await workspaceService.ensureProfile(user.id);
        if (result.success) {
          await refreshProfile();
        } else {
          setError(result.error || 'Failed to repair profile');
        }
      } catch (error: any) {
        setError(error.message);
      }
    }
  }, [user, refreshProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      // Update profile logic here
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
      
      // Organization creation logic here
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

  // Debug utilities
  const debugAuth = async () => {
    return await workspaceService.debugAuth(user?.id);
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
    initializing,
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
    isWorkspaceReady,
    debugAuth,
    systemHealth,
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
