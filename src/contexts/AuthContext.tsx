
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

  const fetchProfile = useCallback(async (user: User): Promise<void> => {
    try {
      console.log(`[AuthContext] Fetching profile for user: ${user.id}`);
      setError(null);
      
      const userProfileData = await profileService.fetchUserProfile(user.id);
      
      if (userProfileData) {
        console.log('[AuthContext] Profile fetched successfully:', userProfileData);
        setProfile(userProfileData);
        return;
      }
      
      // If profile is null, it might be a new user or there was an issue
      console.log('[AuthContext] No profile found, checking if this is a new user...');
      
      // For new users, the trigger should have created the profile
      // If we still don't have one after a short delay, something is wrong
      setTimeout(async () => {
        const retryProfile = await profileService.fetchUserProfile(user.id);
        if (retryProfile) {
          setProfile(retryProfile);
        } else {
          console.error('[AuthContext] Profile still not found after retry');
          setError('Profile not found. Please try logging out and back in.');
        }
      }, 2000);
      
    } catch (e: any) {
      console.error(`[AuthContext] Profile fetch error:`, e);
      setError('Unable to load profile. Please try refreshing the page.');
    }
  }, []);

  const repairProfile = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    try {
      console.log('[AuthContext] Attempting to repair profile...');
      const { error } = await supabase.rpc('repair_user_profile', { 
        user_id_param: user.id 
      });
      
      if (error) {
        console.error('[AuthContext] Profile repair failed:', error);
        return;
      }
      
      console.log('[AuthContext] Profile repair successful');
      
      // Retry fetching the profile
      await fetchProfile(user);
      
    } catch (error) {
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
    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth...');
      setLoading(true);
      
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('[AuthContext] Session retrieved:', !!currentSession);
        
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchProfile(currentUser);
        }
      } catch (e: any) {
        console.error('[AuthContext] Auth initialization error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[AuthContext] Auth state changed:', event);
        setSession(newSession);
        const newUser = newSession?.user ?? null;
        setUser(newUser);
        
        if (event === 'SIGNED_IN' && newUser) {
          setLoading(true);
          await fetchProfile(newUser);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
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
