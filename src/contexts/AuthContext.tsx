
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { authService } from './auth/authService';
import { organizationService } from './auth/organizationService';
import { invitationService } from './auth/invitationService';
import { profileService } from './auth/profileService';
import { UserProfile, AuthContextType } from './auth/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting initial session:', error);
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        if (initialSession && isMounted) {
          console.log('[AuthContext] Initial session found:', initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Ensure profile exists and fetch it
          const profile = await profileService.ensureProfileExists(initialSession.user.id);
          if (isMounted) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('[AuthContext] Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Ensure profile exists when user logs in
          const profile = await profileService.ensureProfileExists(session.user.id);
          if (isMounted) {
            setUserProfile(profile);
          }
        } else {
          setUserProfile(null);
        }
        
        if (initialized) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[AuthContext] Login attempt for:', email);
    
    try {
      const success = await authService.login(email, password);
      console.log('[AuthContext] Login result:', success);
      return success;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('[AuthContext] Logout initiated');
    await authService.logout();
  };

  const signup = async (email: string, password: string, fullName: string, companyName: string): Promise<boolean> => {
    console.log('[AuthContext] Signup attempt for:', email);
    return await authService.signup(email, password, fullName, companyName);
  };

  const checkRoleAccess = (allowedRoles: string[]): boolean => {
    return profileService.checkRoleAccess(userProfile, allowedRoles);
  };

  const createOrganization = async (name: string): Promise<boolean> => {
    if (!user?.id) return false;
    return await organizationService.createOrganization(name, user.id);
  };

  const refreshProfile = async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      const profile = await profileService.ensureProfileExists(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const sendInvitation = async (email: string, role: string): Promise<boolean> => {
    return await invitationService.sendInvitation(email, role, userProfile, user?.id);
  };

  const getInvitations = async (): Promise<any[]> => {
    return await invitationService.getInvitations(userProfile);
  };

  const acceptInvitation = async (token: string): Promise<boolean> => {
    return await invitationService.acceptInvitation(token);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        toast.error(error.message);
        return false;
      }
      toast.success('Password reset email sent');
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset email');
      return false;
    }
  };

  const updatePassword = async (password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return false;
      }
      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      toast.error('Failed to update password');
      return false;
    }
  };

  const value: AuthContextType = {
    session,
    currentUser: user,
    userProfile,
    loading,
    login,
    logout,
    signup,
    checkRoleAccess,
    createOrganization,
    refreshProfile,
    sendInvitation,
    getInvitations,
    acceptInvitation,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
