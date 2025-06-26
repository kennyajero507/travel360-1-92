
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

// Default permissions and stub methods
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Helper: load organization (null if not found)
  const loadOrganization = useCallback(async (org_id: string | null) => {
    const org = await organizationService.loadOrganization(org_id);
    setOrganization(org);
  }, []);

  // Fetch profile + set org/role/permissions
  const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      setError(null);
      const profile = await profileService.fetchUserProfile(uid);
      if (profile) {
        setRole(profile.role || null);
        setTier("basic");
        setPermissions(roleService.getPermissionsForRole((profile.role || "org_owner") as any));
        if (profile.org_id) await loadOrganization(profile.org_id);
        else setOrganization(null);
      }
      setProfile(profile);
      return profile;
    } catch (err) {
      console.error("[AuthContext] Error fetching profile:", err);
      setError("Failed to load profile.");
      setProfile(null);
      return null;
    }
  }, [loadOrganization]);

  const refreshProfile = useCallback(async () => {
    if (user && !loading) {
      setLoading(true);
      await fetchProfile(user.id);
      setLoading(false);
    }
  }, [user, fetchProfile, loading]);

  const repairProfile = useCallback(async () => {
    setError(null);
    await refreshProfile();
  }, [refreshProfile]);

  // Auth state listener with improved error handling
  useEffect(() => {
    let ignore = false;
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (ignore || !mounted) return;

      console.log("[AuthContext] Auth state change:", event, !!session);
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        setLoading(true);
        try {
          await fetchProfile(session.user.id);
        } catch (err) {
          console.error("[AuthContext] Error in auth state change:", err);
          setError("Failed to load user data");
        } finally {
          if (mounted) {
            setLoading(false);
            setInitialLoadComplete(true);
          }
        }
      } else {
        setProfile(null);
        setRole(null);
        setPermissions(initialPermissions);
        setOrganization(null);
        setError(null);
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial session load with timeout
    const loadInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AuthContext] Error getting initial session:", error);
          setError("Failed to get session");
          setLoading(false);
          setInitialLoadComplete(true);
          return;
        }

        await handleAuthStateChange('INITIAL_SESSION', session);
      } catch (err) {
        console.error("[AuthContext] Error in initial session load:", err);
        setError("Failed to initialize session");
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (!initialLoadComplete && mounted) {
        console.warn("[AuthContext] Loading timeout reached");
        setLoading(false);
        setInitialLoadComplete(true);
        setError("Session loading timed out");
      }
    }, 8000);

    loadInitialSession();

    return () => {
      ignore = true;
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Login
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    const { data, error: supaError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (supaError || !data.session) {
      setError(supaError?.message || "Login failed.");
      return false;
    }
    setSession(data.session);
    setUser(data.session.user);
    await fetchProfile(data.session.user.id);
    return true;
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setPermissions(initialPermissions);
    setOrganization(null);
    setLoading(false);
  };

  // FIXED Signup - with proper redirect URL and error handling
  const signup = async (
    email: string,
    password: string,
    fullName?: string,
    role: string = "org_owner",
    companyName?: string
  ) => {
    setError(null);
    setLoading(true);
    
    try {
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
      
      setLoading(false);
      
      if (signUpError) {
        console.error("[AuthContext] Signup error:", signUpError);
        setError(signUpError.message || "Signup failed.");
        return false;
      }

      if (data.user) {
        console.log("[AuthContext] Signup successful, user created:", data.user.id);
        
        // If email is confirmed immediately (in dev), handle the session
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          
          // Give the trigger time to create the profile
          setTimeout(async () => {
            await fetchProfile(data.user!.id);
          }, 1000);
        }
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error("[AuthContext] Unexpected signup error:", err);
      setLoading(false);
      setError(err.message || "An unexpected error occurred during signup.");
      return false;
    }
  };

  // Profile update
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      setError("Not logged in.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setLoading(false);
    if (updateError) {
      setError(updateError.message || "Failed to update profile.");
    } else {
      await refreshProfile();
    }
  };

  // Check role and permissions
  const checkRoleAccess = useCallback(
    (roles: string[]) => roleService.checkRoleAccess(role, roles),
    [role]
  );
  const hasPermission = useCallback(
    (perm: string) => roleService.hasPermission(permissions, perm),
    [permissions]
  );

  // FIXED Organization creation
  const createOrganization = async (orgName: string) => {
    setLoading(true);
    setError(null);
    if (!user) {
      setLoading(false);
      setError("Not logged in");
      return false;
    }
    try {
      console.log("[AuthContext] Creating organization:", orgName, "for user:", user.id);
      
      // Step 1: Create organization
      const org = await organizationService.createOrganization(orgName, user.id);
      console.log("[AuthContext] Organization created:", org);
      
      // Step 2: Link profile to organization
      await organizationService.linkProfileToOrganization(org.id, user.id);
      console.log("[AuthContext] Profile linked to organization");
      
      // Step 3: Update local organization state
      setOrganization(org);
      
      // Step 4: Refresh profile to get updated org_id
      const updatedProfile = await fetchProfile(user.id);
      console.log("[AuthContext] Profile refreshed:", updatedProfile);
      
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("[AuthContext] Organization creation failed:", err);
      setLoading(false);
      setError(err.message || "Failed to create organization.");
      return false;
    }
  };

  // Invitation & org helpers (unchanged, only relevant when extending team)
  const sendInvitation = async (email: string, invitedRole: string) => {
    setLoading(true);
    setError(null);
    if (!organization || !organization.id) {
      setError("You must have an organization first");
      setLoading(false);
      return false;
    }
    try {
      await organizationService.sendInvitation(email, invitedRole, organization.id);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to send invitation.");
      setLoading(false);
      return false;
    }
  };

  const getInvitations = async () => {
    if (!organization || !organization.id) return [];
    try {
      return await organizationService.getInvitations(organization.id);
    } catch {
      return [];
    }
  };

  const acceptInvitation = async (token: string) => {
    setLoading(true);
    setLoading(false);
    return true;
  };

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
