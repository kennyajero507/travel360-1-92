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

  // Enhanced profile fetching with organization loading fix
  const fetchProfile = useCallback(async (uid: string, retryCount = 0): Promise<UserProfile | null> => {
    const maxRetries = 3;
    const retryDelay = [1000, 2000, 3000];
    
    try {
      console.log(`[AuthContext] Fetching profile for user: ${uid} (attempt ${retryCount + 1})`);
      setError(null);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (profileError) {
        console.error('[AuthContext] Profile fetch error:', profileError);
        
        if (profileError.code === 'PGRST116' && retryCount < maxRetries) {
          console.log(`[AuthContext] Profile not found, retrying in ${retryDelay[retryCount]}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay[retryCount]));
          return fetchProfile(uid, retryCount + 1);
        }
        
        if (profileError.code === 'PGRST116') {
          console.log('[AuthContext] Creating profile manually after retries failed');
          return await createProfileManually(uid);
        }
        
        setError('Failed to load profile');
        return null;
      }

      if (profileData) {
        console.log('[AuthContext] Profile loaded successfully:', profileData);
        setProfile(profileData);
        setRole(profileData.role);
        setPermissions(roleService.getPermissionsForRole(profileData.role as any));
        
        // Load organization with enhanced error handling and timeout
        if (profileData.org_id) {
          console.log('[AuthContext] Loading organization:', profileData.org_id);
          try {
            // Add timeout protection for organization loading
            const orgLoadPromise = organizationService.loadOrganization(profileData.org_id);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Organization loading timeout')), 5000)
            );
            
            const org = await Promise.race([orgLoadPromise, timeoutPromise]);
            console.log('[AuthContext] Organization loaded:', org);
            setOrganization(org);
          } catch (orgError: any) {
            console.warn('[AuthContext] Organization loading failed, but continuing:', orgError.message);
            // Don't fail the entire auth process if organization loading fails
            // User can still access the app with their profile
            setOrganization(null);
          }
        } else {
          console.log('[AuthContext] No organization ID in profile');
          setOrganization(null);
        }
        
        return profileData;
      }

      if (retryCount < maxRetries) {
        console.log(`[AuthContext] No profile data, retrying in ${retryDelay[retryCount]}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay[retryCount]));
        return fetchProfile(uid, retryCount + 1);
      }

      return await createProfileManually(uid);

    } catch (err: any) {
      console.error('[AuthContext] Unexpected error fetching profile:', err);
      
      if (retryCount < maxRetries) {
        console.log(`[AuthContext] Retrying due to error in ${retryDelay[retryCount]}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay[retryCount]));
        return fetchProfile(uid, retryCount + 1);
      }
      
      setError(err.message || 'Failed to load profile');
      return null;
    }
  }, []);

  // Manual profile creation as fallback
  const createProfileManually = async (uid: string): Promise<UserProfile | null> => {
    try {
      console.log('[AuthContext] Creating profile manually for user:', uid);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const profileData = {
        id: uid,
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
        console.error('[AuthContext] Failed to create profile manually:', error);
        setError('Failed to create user profile');
        return null;
      }

      console.log('[AuthContext] Profile created manually:', data);
      setProfile(data);
      setRole(data.role);
      setPermissions(roleService.getPermissionsForRole(data.role as any));
      
      return data;
    } catch (error: any) {
      console.error('[AuthContext] Error in manual profile creation:', error);
      setError('Failed to create profile');
      return null;
    }
  };

  // Enhanced auth state management with better timeout handling
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('[AuthContext] Auth state change:', event, !!session);
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        console.log('[AuthContext] Starting profile fetch...');
        setLoading(true);
        
        try {
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            console.log('[AuthContext] Profile fetch completed, stopping loading');
            setLoading(false);
          }
        } catch (error) {
          console.error('[AuthContext] Profile fetch failed:', error);
          if (mounted) {
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

    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session with enhanced error handling
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting initial session:', error);
          setError('Failed to get session');
          setLoading(false);
          return;
        }
        
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

    // Enhanced timeout protection
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[AuthContext] Auth initialization timeout - forcing stop loading');
        setLoading(false);
        if (!session && !profile) {
          setError('Authentication initialization timeout - please refresh the page');
        }
      }
    }, 15000); // Increased to 15 seconds for better reliability

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Enhanced login with better error handling
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
        let errorMessage = 'Login failed';
        
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address';
        } else if (authError.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later';
        }
        
        setError(errorMessage);
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
      setError('Network error. Please check your connection and try again');
      setLoading(false);
      return false;
    }
  };

  // Enhanced signup with better validation
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
      
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return false;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return false;
      }
      
      const redirectUrl = `${window.location.origin}/login`;
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || email.split('@')[0],
            role,
            company_name: companyName,
          }
        },
      });
      
      if (signUpError) {
        console.error('[AuthContext] Signup error:', signUpError);
        let errorMessage = 'Registration failed';
        
        if (signUpError.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists';
        } else if (signUpError.message.includes('Password should be')) {
          errorMessage = 'Password is too weak. Please use a stronger password';
        } else if (signUpError.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address';
        }
        
        setError(errorMessage);
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
      setError('Network error. Please check your connection and try again');
      setLoading(false);
      return false;
    }
  };

  // Enhanced logout
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      // Auth state change will handle cleanup
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

  // Enhanced profile refresh
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const repairProfile = useCallback(async () => {
    setError(null);
    if (user) {
      await createProfileManually(user.id);
    }
  }, [user]);

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
