import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, UserProfile } from './auth/types';
import { authService } from './auth/authService';
import { profileService } from './auth/profileService';
import { organizationService } from './auth/organizationService';
import { invitationService } from './auth/invitationService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await profileService.fetchUserProfile(currentUser.id);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let profileFetchTimeout: NodeJS.Timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (!isMounted) return;

        setSession(newSession);
        setCurrentUser(newSession?.user ?? null);
        
        // Clear any existing timeout
        if (profileFetchTimeout) {
          clearTimeout(profileFetchTimeout);
        }
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Don't block the auth state change with profile fetching
          profileFetchTimeout = setTimeout(async () => {
            if (isMounted) {
              const profile = await profileService.fetchUserProfile(newSession.user.id);
              if (isMounted) {
                setUserProfile(profile);
              }
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
        
        // Always set loading to false after auth state change
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        setSession(existingSession);
        setCurrentUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          const profile = await profileService.fetchUserProfile(existingSession.user.id);
          if (isMounted) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      isMounted = false;
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, fullName: string, companyName: string): Promise<boolean> => {
    return authService.signup(email, password, fullName, companyName);
  };

  const createOrganization = async (name: string): Promise<boolean> => {
    if (!currentUser) return false;
    return organizationService.createOrganization(name, currentUser.id);
  };

  const sendInvitation = async (email: string, role: string): Promise<boolean> => {
    return invitationService.sendInvitation(email, role, userProfile, currentUser?.id);
  };

  const acceptInvitation = async (token: string): Promise<boolean> => {
    return invitationService.acceptInvitation(token);
  };

  const getInvitations = async (): Promise<any[]> => {
    return invitationService.getInvitations(userProfile);
  };

  const checkRoleAccess = (allowedRoles: string[]): boolean => {
    return profileService.checkRoleAccess(userProfile, allowedRoles);
  };

  const value: AuthContextType = {
    currentUser,
    session,
    loading,
    userProfile,
    login: authService.login,
    signup,
    logout: authService.logout,
    createOrganization,
    sendInvitation,
    acceptInvitation,
    getInvitations,
    resetPassword: authService.resetPassword,
    updatePassword: authService.updatePassword,
    checkRoleAccess,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
