import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { profileService } from "./auth/profileService";
import defaultPermissions, { getPermissionsForRole } from "./role/defaultPermissions";
import { UserProfile } from "./auth/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: string | null;
  permissions: ReturnType<typeof getPermissionsForRole>;
  tier: string;
  loading: boolean;
  isLoading: boolean; // for backward compat
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

// Default stub permissions + method impls for first render
const initialPermissions = defaultPermissions["org_owner"];
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

  // Helper: load organization by org_id
  const loadOrganization = useCallback(async (org_id: string | null) => {
    if (!org_id) {
      setOrganization(null);
      return;
    }
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", org_id)
      .maybeSingle();
    if (error) {
      setOrganization(null);
      return;
    }
    setOrganization(data);
  }, []);

  // Fetch active profile from DB
  const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      const profile = await profileService.fetchUserProfile(uid);
      if (profile) {
        setRole(profile.role || null);
        setTier("basic");
        setPermissions(getPermissionsForRole((profile.role || "org_owner") as any));
        if (profile.org_id) await loadOrganization(profile.org_id);
        else setOrganization(null);
      }
      setProfile(profile);
      return profile;
    } catch (err) {
      setError("Failed to load profile.");
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
    setError(null);
    await refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      // Important: Don't fetchProfile directly here, but with setTimeout to avoid deadlocks
      if (session?.user) {
        setLoading(true);
        setTimeout(async () => {
          if (!ignore) await fetchProfile(session.user.id);
          setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
        setPermissions(initialPermissions);
        setOrganization(null);
        setLoading(false);
      }
    });
    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => { ignore = true; subscription.unsubscribe(); };
  }, [fetchProfile]);

  // Login handler
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

  // Logout handler
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

  // Signup handler (with profile upsert on onboarding)
  const signup = async (
    email: string,
    password: string,
    fullName?: string,
    role: string = "org_owner",
    companyName?: string
  ) => {
    setError(null);
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
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
    if (signUpError || !data.user) {
      setError(signUpError?.message || "Signup failed.");
      return false;
    }
    setSession(data.session || null);
    setUser(data.user);
    // Profile will be created via trigger
    setTimeout(async () => {
      await fetchProfile(data.user!.id);
    }, 0);
    return true;
  };

  // Profile updater
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

  // Role-based access check
  const checkRoleAccess = useCallback(
    (roles: string[]) => {
      if (!role) return false;
      return roles.includes(role);
    },
    [role]
  );

  // Permission check
  const hasPermission = useCallback(
    (perm: string) => {
      return permissions?.[perm] ?? false;
    },
    [permissions]
  );

  // ---- Organization and Invitation logic ----

  // Org creation
  const createOrganization = async (orgName: string) => {
    setLoading(true);
    setError(null);
    if (!user) {
      setLoading(false);
      setError("Not logged in");
      return false;
    }
    // Here you would call a backend function or insert into organizations table
    const { data, error: orgError } = await supabase
      .from("organizations")
      .insert([{ name: orgName, owner_id: user.id }])
      .select()
      .single();
    setLoading(false);
    if (orgError) {
      setError(orgError.message || "Failed to create organization.");
      return false;
    }
    setOrganization(data);
    await refreshProfile();
    return true;
  };

  // Send invitation (stub)
  const sendInvitation = async (email: string, invitedRole: string) => {
    setLoading(true);
    setError(null);
    if (!organization || !organization.id) {
      setError("You must have an organization first");
      setLoading(false);
      return false;
    }
    // Insert into invitations table
    const { error: inviteError } = await supabase
      .from("invitations")
      .insert({
        email,
        role: invitedRole,
        org_id: organization.id,
      });
    setLoading(false);
    if (inviteError) {
      setError(inviteError.message || "Failed to send invitation.");
      return false;
    }
    return true;
  };

  // Get invitations (stub)
  const getInvitations = async () => {
    if (!organization || !organization.id) return [];
    const { data, error: invError } = await supabase
      .from("invitations")
      .select("*")
      .eq("org_id", organization.id)
      .order("created_at", { ascending: false });
    if (invError) return [];
    return data || [];
  };

  // Accept invitation (stub)
  const acceptInvitation = async (token: string) => {
    // Here you would call an edge function or backend RPC to accept invite
    setLoading(true);
    // (Stub implementation here; integrate real logic as needed.)
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
