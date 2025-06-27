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

  // Helper: load organization (null if not found)
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

  // Fetch profile + set org/role/permissions
  const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      console.log('[AuthContext] Fetching profile for user:', uid);
      setError(null);
      
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
        setError("Profile not found. Please contact support if this issue persists.");
        return null;
      }
    } catch (err: any) {
      console.error("[AuthContext] Error fetching profile:", err);
      setError(err.message || "Failed to load profile.");
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
      // Try to repair the profile using the profile service
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
        setError("Failed to repair profile. Please contact support.");
      }
    } catch (err: any) {
      console.error('[AuthContext] Profile repair failed:', err);
      setError(err.message || "Failed to repair profile.");
    } finally {
      setLoading(false);
    }
  }, [user, loadOrganization]);

  // Auth state listener with improved error handling
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
        // Use setTimeout to prevent blocking the auth state change
        setTimeout(async () => {
          if (!ignore) {
            await fetchProfile(session.user.id);
            setLoading(false);
          }
        }, 100);
      } else {
        setProfile(null);
        setRole(null);
        setPermissions(initialPermissions);
        setOrganization(null);
        setError(null);
        setLoading(false);
      }
    });

    // Initial session load with better error handling
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (ignore) return;
      
      if (sessionError) {
        console.error('[AuthContext] Error getting initial session:', sessionError);
        setError(sessionError.message);
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

  // Login with improved error handling
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
      setSession(data.session);
      setUser(data.session.user);
      
      // Profile will be loaded by the auth state change listener
      return true;
    } catch (err: any) {
      console.error('[AuthContext] Unexpected login error:', err);
      setError(err.message || "An unexpected error occurred during login.");
      setLoading(false);
      return false;
    }
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
    setError(null);
    setLoading(false);
  };

  // Signup with proper redirect URL and error handling
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
        
        // If email is confirmed immediately (in dev), handle the session
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          
          // Give the trigger time to create the profile
          setTimeout(async () => {
            await fetchProfile(data.user!.id);
            setLoading(false);
          }, 1000);
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

  // Organization creation
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

  // Invitation helpers
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
