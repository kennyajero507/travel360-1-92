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
  debugAuth: () => Promise<any>;
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
  debugAuth: async () => ({}),
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

  // Helper: load organization
  const loadOrganization = useCallback(async (org_id: string | null) => {
    if (!org_id) {
      setOrganization(null);
      return;
    }
    try {
      const org = await organizationService.loadOrganization(org_id);
      setOrganization(org);
    } catch (err) {
      console.warn('[AuthContext] Failed to load organization:', err);
      setOrganization(null);
    }
  }, []);

  // Simplified profile fetching
  const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    console.log('[AuthContext] Fetching profile for user:', uid);
    setError(null);
    
    try {
      const profile = await profileService.fetchUserProfile(uid);
      
      if (profile) {
        console.log('[AuthContext] Profile loaded successfully:', profile);
        setRole(profile.role || null);
        setTier("basic");
        setPermissions(roleService.getPermissionsForRole((profile.role || "org_owner") as any));
        
        if (profile.org_id) {
          await loadOrganization(profile.org_id);
        } else {
          setOrganization(null);
        }
        
        setProfile(profile);
        return profile;
      } else {
        console.warn('[AuthContext] No profile found for user:', uid);
        setProfile(null);
        setError("Profile setup required. We'll help you create one.");
        return null;
      }
    } catch (err: any) {
      console.error("[AuthContext] Error fetching profile:", err);
      setError("Profile loading failed. Please try refreshing the page.");
      setProfile(null);
      return null;
    }
  }, [loadOrganization]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchProfile(user.id);
      setLoading(false);
    }
  }, [user, fetchProfile]);

  const repairProfile = useCallback(async () => {
    if (!user) {
      setError("No user session found");
      return;
    }
    
    console.log('[AuthContext] Attempting to repair profile for user:', user.id);
    setError(null);
    setLoading(true);
    
    try {
      const repairedProfile = await profileService.repairUserProfile(user.id);
      
      if (repairedProfile) {
        console.log('[AuthContext] Profile repaired successfully:', repairedProfile);
        setProfile(repairedProfile);
        setRole(repairedProfile.role || null);
        setPermissions(roleService.getPermissionsForRole((repairedProfile.role || "org_owner") as any));
        
        if (repairedProfile.org_id) {
          await loadOrganization(repairedProfile.org_id);
        }
        
        setError(null);
      } else {
        setError("Profile repair failed. Please contact support if this continues.");
      }
    } catch (err: any) {
      console.error('[AuthContext] Profile repair failed:', err);
      setError("Profile repair failed. Please try logging out and back in.");
    } finally {
      setLoading(false);
    }
  }, [user, loadOrganization]);

  // Debug function
  const debugAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const debugInfo = await profileService.debugProfile(user?.id);
      
      return {
        authUser: user,
        debugInfo,
        loading,
        error,
        profile,
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Debug failed' };
    }
  }, [loading, error, profile]);

  // Simplified auth state listener
  useEffect(() => {
    let ignore = false;
    
    console.log('[AuthContext] Setting up auth state listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (ignore) return;
      
      console.log('[AuthContext] Auth state changed:', event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        setLoading(true);
        await fetchProfile(session.user.id);
        setLoading(false);
      } else {
        setProfile(null);
        setRole(null);
        setPermissions(initialPermissions);
        setOrganization(null);
        setError(null);
        setLoading(false);
      }
    });

    // Initial session load
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (ignore) return;
      
      if (sessionError) {
        console.error('[AuthContext] Error getting initial session:', sessionError);
        setError("Session initialization failed. Please refresh the page.");
        setLoading(false);
        return;
      }
      
      console.log('[AuthContext] Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (!ignore) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => { 
      console.log('[AuthContext] Cleaning up auth listener');
      ignore = true;
      subscription.unsubscribe(); 
    };
  }, [fetchProfile]);

  // Enhanced login
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const { data, error: supaError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (supaError) {
        console.error('[AuthContext] Login error:', supaError);
        setError(supaError.message || "Login failed.");
        setLoading(false);
        return false;
      }
      
      if (!data.session) {
        setError("Login failed - no session created.");
        setLoading(false);
        return false;
      }
      
      console.log('[AuthContext] Login successful:', data.session.user.id);
      return true;
    } catch (err: any) {
      console.error('[AuthContext] Unexpected login error:', err);
      setError("An unexpected error occurred during login.");
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // State will be reset by the auth state change listener
  };

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
      
      if (signUpError) {
        console.error("[AuthContext] Signup error:", signUpError);
        setError(signUpError.message || "Signup failed.");
        setLoading(false);
        return false;
      }

      if (data.user) {
        console.log("[AuthContext] Signup successful, user created:", data.user.id);
        
        if (data.session) {
          // Wait for profile creation and verify
          setTimeout(async () => {
            const profile = await fetchProfile(data.user!.id);
            if (!profile) {
              console.warn('[AuthContext] Profile not created after signup, may need manual repair');
            }
            setLoading(false);
          }, 2000); // Give trigger time to execute
        } else {
          setLoading(false);
        }
        
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (err: any) {
      console.error("[AuthContext] Unexpected signup error:", err);
      setLoading(false);
      setError("An unexpected error occurred during signup.");
      return false;
    }
  };

  // Keep existing methods unchanged
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

  // Keep existing role and permission methods
  const checkRoleAccess = useCallback(
    (roles: string[]) => roleService.checkRoleAccess(role, roles),
    [role]
  );
  const hasPermission = useCallback(
    (perm: string) => roleService.hasPermission(permissions, perm),
    [permissions]
  );

  // Keep existing organization methods unchanged
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
      
      const org = await organizationService.createOrganization(orgName, user.id);
      console.log("[AuthContext] Organization created:", org);
      
      await organizationService.linkProfileToOrganization(org.id, user.id);
      console.log("[AuthContext] Profile linked to organization");
      
      setOrganization(org);
      
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

  // Keep existing invitation methods unchanged
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
    debugAuth,
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
