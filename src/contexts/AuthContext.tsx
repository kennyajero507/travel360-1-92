
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, UserProfile } from './auth/types';
import { authService } from './auth/authService';
import { profileService } from './auth/profileService';
import { organizationService } from './auth/organizationService';
import { invitationService } from './auth/invitationService';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  session: null,
  loading: true,
  userProfile: null,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  createOrganization: async () => false,
  sendInvitation: async () => false,
  acceptInvitation: async () => false,
  getInvitations: async () => [],
  resetPassword: async () => false,
  updatePassword: async () => false,
  checkRoleAccess: () => false,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  // Refresh profile function
  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await profileService.fetchUserProfile(currentUser.id);
      setUserProfile(profile);
    }
  };

  // Handle authentication state changes with better error handling
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

  // Enhanced logout function with navigation
  const logout = async (): Promise<void> => {
    await authService.logout();
    navigate('/login');
  };

  // Enhanced organization creation with refresh
  const createOrganization = async (name: string): Promise<boolean> => {
    const success = await organizationService.createOrganization(name, currentUser?.id || '');
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  // Enhanced invitation acceptance with refresh
  const acceptInvitation = async (token: string): Promise<boolean> => {
    const success = await invitationService.acceptInvitation(token);
    if (success && currentUser) {
      await refreshProfile();
    }
    return success;
  };

  const value = {
    currentUser,
    session,
    loading,
    userProfile,
    login: authService.login,
    signup: authService.signup,
    logout,
    createOrganization,
    sendInvitation: (email: string, role: string) => 
      invitationService.sendInvitation(email, role, userProfile, currentUser?.id),
    acceptInvitation,
    getInvitations: () => invitationService.getInvitations(userProfile),
    resetPassword: authService.resetPassword,
    updatePassword: authService.updatePassword,
    checkRoleAccess: (allowedRoles: string[]) => 
      profileService.checkRoleAccess(userProfile, allowedRoles),
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
