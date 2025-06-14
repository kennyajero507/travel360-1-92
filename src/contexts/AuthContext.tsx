
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { authService } from './auth/authService';
import { profileService } from './auth/profileService';
import { UserProfile } from './auth/types';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: typeof authService.login;
  signup: typeof authService.signup;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createOrganization: (name: string) => Promise<boolean>;
  sendInvitation: (email: string, role: string) => Promise<boolean>;
  getInvitations: () => Promise<any[]>;
  acceptInvitation: (token: string) => Promise<boolean>;
  checkRoleAccess: (roles: string[]) => boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (user: User) => {
    try {
      const userProfile = await profileService.fetchUserProfile(user.id);
      setProfile(userProfile);
    } catch (e: any) {
      setError(e.message);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      }
      setLoading(false);
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
    checkRoleAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
