
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
  const [fetchAttempts, setFetchAttempts] = useState(0);
  
  // Role state
  const [tier, setTier] = useState<SubscriptionTier>('starter');
  const [permissions, setPermissions] = useState<Permissions>(getPermissionsForRole('agent'));

  const MAX_FETCH_ATTEMPTS = 3;
  const FETCH_TIMEOUT = 10000; // 10 seconds

  const fetchProfile = useCallback(async (user: User): Promise<void> => {
    if (fetchAttempts >= MAX_FETCH_ATTEMPTS) {
      console.log('[AuthContext] Max fetch attempts reached, stopping retries');
      setError('Unable to load profile after multiple attempts');
      setLoading(false);
      return;
    }

    try {
      console.log(`[AuthContext] Fetching profile for user: ${user.id}, attempt: ${fetchAttempts + 1}`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), FETCH_TIMEOUT);
      });
      
      const fetchPromise = profileService.fetchUserProfile(user.id);
      const userProfileData = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (userProfileData) {
        console.log('[AuthContext] Profile fetched successfully:', userProfileData);
        setProfile(userProfileData);
        setError(null);
        setFetchAttempts(0);
        return;
      }
      
      // Profile is null, try repair if this is the first attempt
      if (fetchAttempts === 0) {
        console.log('[AuthContext] Profile is null, attempting repair...');
        await repairProfile();
        setFetchAttempts(prev => prev + 1);
        
        // Wait a bit and retry
        setTimeout(() => {
          fetchProfile(user);
        }, 2000);
        return;
      }
      
      // Create fallback profile after first retry
      console.log('[AuthContext] Creating fallback profile');
      const fallbackProfile: UserProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: 'org_owner',
        created_at: new Date().toISOString(),
        org_id: null,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setProfile(fallbackProfile);
      setError('Profile setup in progress. Please refresh if you encounter issues.');
      setFetchAttempts(0);
      
    } catch (e: any) {
      console.error(`[AuthContext] Profile fetch error (attempt ${fetchAttempts + 1}):`, e);
      
      if (fetchAttempts < MAX_FETCH_ATTEMPTS - 1) {
        setFetchAttempts(prev => prev + 1);
        setTimeout(() => {
          fetchProfile(user);
        }, 3000);
        return;
      }
      
      setError('Unable to load profile. Please try logging in again.');
      setFetchAttempts(0);
    }
  }, [fetchAttempts]);

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
      
    } catch (error) {
      console.error('[AuthContext] Profile repair error:', error);
    }
  }, [user]);
  
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
      setFetchAttempts(0);
      
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
        setFetchAttempts(0);
        
        if (event === 'SIGNED_IN' && newUser) {
          setLoading(true);
          await fetchProfile(newUser);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
          setFetchAttempts(0);
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
      setFetchAttempts(0);
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
