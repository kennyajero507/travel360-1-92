import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { authService } from './auth/authService';
import { profileService } from './auth/profileService';
import { UserProfile } from './auth/types';
import { UserRole, SubscriptionTier, Permissions } from './role/types';
import { getPermissionsForRole } from './role/defaultPermissions';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  // Auth methods
  login: typeof authService.login;
  signup: typeof authService.signup;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  repairProfile: () => Promise<void>;
  createOrganization: (name: string) => Promise<boolean>;
  sendInvitation: (email: string, role: string) => Promise<boolean>;
  getInvitations: () => Promise<any[]>;
  acceptInvitation: (token: string) => Promise<boolean>;
  checkRoleAccess: (roles: string[]) => boolean;
  // Role methods
  role: UserRole;
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  permissions: Permissions;
  currentUser: { id: string; name: string; email: string };
  organization: { id: string; name: string; ownerId: string; subscriptionTier: SubscriptionTier } | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export for backward compatibility
export const useRole = () => {
  const context = useAuth();
  return {
    role: context.role,
    tier: context.tier,
    setTier: context.setTier,
    hasPermission: context.hasPermission,
    permissions: context.permissions,
    currentUser: context.currentUser,
    organization: context.organization,
    loading: context.loading
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Role state
  const [tier, setTier] = useState<SubscriptionTier>('starter');
  const [permissions, setPermissions] = useState<Permissions>(getPermissionsForRole('agent'));

  // Robust profile fetching with extra retry & logging
  const fetchProfile = useCallback(async (user: User, retries = 3): Promise<void> => {
    try {
      setError(null);
      const userProfileData = await profileService.fetchUserProfile(user.id);

      if (userProfileData) {
        setProfile(userProfileData);
        return;
      }

      if (retries > 0) {
        setTimeout(() => fetchProfile(user, retries - 1), 1000 * (4 - retries));
      } else {
        setError('Profile not found after several retries. Please contact support or try logging out and in.');
      }
    } catch (e: any) {
      setError('Unable to load profile. ' + (e?.message || 'Please try refreshing the page.'));
      console.error("[AuthContext] Profile fetch error:", e);
    }
  }, []);

  // Profile repair now attempts a fetch again if profile missing
  const repairProfile = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      setError(null);
      const { error } = await supabase.rpc('repair_user_profile', { user_id_param: user.id });
      if (error) {
        setError('Failed to repair profile. Please contact support.');
        console.error('[AuthContext] Profile repair failed:', error);
        return;
      }
      await fetchProfile(user);
    } catch (error) {
      setError('Critical error repairing profile. Please refresh or contact support.');
      console.error('[AuthContext] Profile repair error:', error);
    }
  }, [user, fetchProfile]);

  // Derived role data
  const role = (profile?.role as UserRole) || 'agent';

  const currentUser = profile ? {
    id: profile.id,
    name: profile.full_name || 'Anonymous',
    email: profile.email || ''
  } : { id: '', name: 'Guest', email: '' };

  const organization = profile?.org_id ? {
    id: profile.org_id,
    name: 'Organization',
    ownerId: '',
    subscriptionTier: 'starter' as SubscriptionTier
  } : undefined;

  // Update permissions when role or tier changes
  useEffect(() => {
    if (!role) {
      setPermissions(getPermissionsForRole('agent'));
      return;
    }
    
    let updatedPermissions = {...getPermissionsForRole(role)};
    
    // Apply tier-specific permissions for tour operators
    if (role === 'tour_operator') {
      updatedPermissions.canManageAgents = (tier === 'pro' || tier === 'enterprise');
      updatedPermissions.canAddHotels = true;
    }
    
    // Apply tier-specific permissions for agents
    if (role === 'agent') {
      if (tier === 'pro' || tier === 'enterprise') {
        updatedPermissions.canAddHotels = true;
      } else {
        updatedPermissions.canAddHotels = true;
      }
    }
    
    // Organization owners have additional permissions
    if (role === 'org_owner') {
      updatedPermissions.canManageAgents = true;
      
      if (tier === 'pro' || tier === 'enterprise') {
        updatedPermissions.canViewReports = true;
      }
    }
    
    // System admins always have full permissions regardless of tier
    if (role === 'system_admin') {
      Object.keys(updatedPermissions).forEach(key => {
        updatedPermissions[key as keyof Permissions] = true;
      });
    }
    
    setPermissions(updatedPermissions);
  }, [role, tier]);
  
  useEffect(() => {
    let didCancel = false;

    setLoading(true);

    // Set up RLS-safe auth state listener (NO async in callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);

      // Defer async fetch to outside synchronous callback
      if (event === 'SIGNED_IN' && newUser) {
        setLoading(true);
        setTimeout(() => {
          if (!didCancel) fetchProfile(newUser);
          setLoading(false);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setError(null);
      }
    });

    // Initial session load (also defer fetch so logic is same as auth callback)
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setTimeout(() => {
          if (!didCancel) fetchProfile(currentUser);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      didCancel = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);
  
  const logout = async () => {
    await authService.logout();
  };
  
  const refreshProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchProfile(user);
      setLoading(false);
    }
  }, [user, fetchProfile]);

  const checkRoleAccess = useCallback((roles: string[]) => {
    if (!profile) return false;
    if (profile.role === 'system_admin') return true;
    return roles.includes(profile.role);
  }, [profile]);

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    if (role === 'system_admin') return true;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    
    return role === requiredRole;
  };

  const createOrganization = async (name: string) => {
    const success = await authService.createOrganization(name);
    if (success) {
      await refreshProfile();
    }
    return success;
  };
  
  const sendInvitation = async (email: string, role: string) => {
    if (!profile?.org_id) {
      toast.error("You must belong to an organization to send invitations.");
      return false;
    }
    // Just support role/organization invitations as defined in DB
    return await authService.sendInvitation(email, role, profile.org_id);
  };

  const getInvitations = async (): Promise<any[]> => {
    if (!profile?.org_id) {
      return [];
    }
    // Only fetch from invitations (table exists)
    return await authService.getInvitations(profile.org_id);
  };

  const acceptInvitation = async (token: string) => {
    const success = await authService.acceptInvitation(token);
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  // Adjusted loading logic: loading or profile not loaded
  const isAppLoading = loading || (session && !profile && !error);

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading: isAppLoading,
    error,
    login: authService.login,
    signup: authService.signup,
    logout,
    refreshProfile,
    repairProfile,
    createOrganization,
    sendInvitation,
    getInvitations,
    acceptInvitation,
    checkRoleAccess,
    // Role data
    role,
    tier,
    setTier,
    hasPermission,
    permissions,
    currentUser,
    organization
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
