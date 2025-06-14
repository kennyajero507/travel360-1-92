
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

  const fetchProfile = useCallback(async (user: User) => {
    try {
      const userProfileData = await profileService.fetchUserProfile(user.id);
      setProfile(userProfileData);
    } catch (e: any) {
      setError(e.message);
      setProfile(null);
    }
  }, []);
  
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
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        const newUser = newSession?.user ?? null;
        setUser(newUser);
        if (event === 'SIGNED_IN' && newUser) {
          setLoading(true);
          await fetchProfile(newUser);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );
    
    return () => {
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
    return await authService.sendInvitation(email, role, profile.org_id);
  };

  const getInvitations = async (): Promise<any[]> => {
    if (!profile?.org_id) {
      return [];
    }
    return await authService.getInvitations(profile.org_id);
  };

  const acceptInvitation = async (token: string) => {
    const success = await authService.acceptInvitation(token);
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    error,
    login: authService.login,
    signup: authService.signup,
    logout,
    refreshProfile,
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
