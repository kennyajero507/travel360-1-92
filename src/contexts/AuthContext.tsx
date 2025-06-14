
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { authService } from './auth/authService';
import { organizationService } from './auth/organizationService';
import { invitationService } from './auth/invitationService';
import { profileService } from './auth/profileService';
import { UserProfile } from './auth/types';

interface AuthContextType {
  session: Session | null;
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string, companyName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  createOrganization: (name: string) => Promise<boolean>;
  sendInvitation: (email: string, role: string) => Promise<boolean>;
  acceptInvitation: (token: string) => Promise<boolean>;
  getInvitations: () => Promise<any[]>;
  checkRoleAccess: (allowedRoles: string[]) => boolean;
  checkUserNeedsOrganization: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Only this simple method, no more retries/ensure/exotic fallback
  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setUserProfile(null);
      return;
    }
    try {
      setAuthError(null);
      setLoading(true);
      // Fetch the profile or fallback, but ONLY ONCE per auth change
      const profile = await profileService.fetchUserProfile(session.user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('[AuthContext] Error refreshing profile:', error);
      setAuthError('Failed to load user profile');
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Auth state and session management
  useEffect(() => {
    let ignore = false;

    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AuthContext] Error getting initial session:', error);
          setAuthError(error.message);
        } else {
          setSession(initialSession);
          setCurrentUser(initialSession?.user || null);
        }
      } catch (error) {
        console.error('[AuthContext] Error in getInitialSession:', error);
        setAuthError('Failed to initialize authentication');
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (ignore) return; // avoid state after unmount
        setSession(session);
        setCurrentUser(session?.user || null);
        if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          setAuthError(null);
        } else if (session?.user) {
          // Fresh login/session: reset profile, will refetch below
          setUserProfile(null);
        }
      }
    );
    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  // Profile loads only on session user change, or when refresh explicitly called
  useEffect(() => {
    if (session?.user?.id && !userProfile && !loading) {
      refreshProfile();
    }
    // If logged out, clear profile
    if (!session?.user?.id) {
      setUserProfile(null);
    }
    // eslint-disable-next-line
  }, [session?.user?.id]);

  // Simplified login/signup/logout etc.
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    const success = await authService.login(email, password);
    if (success) {
      setAuthError(null);
      // profile will reload due to session change
      return true;
    } else {
      setAuthError('Invalid login credentials');
    }
    return false;
  };

  const signup = async (email: string, password: string, fullName: string, companyName: string): Promise<boolean> => {
    setAuthError(null);
    return await authService.signup(email, password, fullName, companyName);
  };

  const logout = async (): Promise<void> => {
    setAuthError(null);
    await authService.logout();
    setUserProfile(null);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    return await authService.resetPassword(email);
  };

  const updatePassword = async (password: string): Promise<boolean> => {
    setAuthError(null);
    return await authService.updatePassword(password);
  };

  const createOrganization = async (name: string): Promise<boolean> => {
    if (!session?.user?.id) return false;
    setAuthError(null);
    const success = await organizationService.createOrganization(name, session.user.id);
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  const sendInvitation = async (email: string, role: string): Promise<boolean> => {
    setAuthError(null);
    return await invitationService.sendInvitation(email, role, userProfile, session?.user?.id);
  };

  const acceptInvitation = async (token: string): Promise<boolean> => {
    setAuthError(null);
    const success = await invitationService.acceptInvitation(token);
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  const getInvitations = async (): Promise<any[]> => {
    setAuthError(null);
    return await invitationService.getInvitations(userProfile);
  };

  const checkRoleAccess = (allowedRoles: string[]): boolean => {
    return profileService.checkRoleAccess(userProfile, allowedRoles);
  };

  const checkUserNeedsOrganization = async (): Promise<boolean> => {
    if (!session?.user?.id) return false;
    return await organizationService.checkUserNeedsOrganization(session.user.id);
  };

  const value: AuthContextType = {
    session,
    currentUser,
    userProfile,
    loading,
    authError,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    createOrganization,
    sendInvitation,
    acceptInvitation,
    getInvitations,
    checkRoleAccess,
    checkUserNeedsOrganization,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
