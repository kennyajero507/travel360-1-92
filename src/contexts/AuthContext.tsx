import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { organizationService } from './auth/organizationService';
import { invitationService } from './auth/invitationService';
import { profileService } from './auth/profileService';
import { authService } from './auth/authService';
import { UserProfile, AuthContextType } from './auth/types';
import { needsOrganizationSetup } from '../utils/authValidation';
import OrganizationSetup from '../components/OrganizationSetup';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showOrgSetup, setShowOrgSetup] = useState(false);

  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', event, session ? 'HAS_SESSION' : 'NO_SESSION');
        
        setSession(session);
        setUser(session?.user ?? null);
        setAuthError(null);
        
        if (session?.user) {
          console.log('[AuthContext] User signed in, fetching profile...');
          
          setTimeout(async () => {
            try {
              setLoading(true);
              const profile = await profileService.ensureProfileExists(session.user.id);
              
              if (profile) {
                setUserProfile(profile);
                console.log('[AuthContext] Profile loaded:', profile.role, profile.org_id ? `(org: ${profile.org_id})` : '(no org)');
                
                // Use the validation utility to check if org setup is needed
                const needsSetup = needsOrganizationSetup(profile);
                setShowOrgSetup(needsSetup);
                
                if (needsSetup) {
                  console.log('[AuthContext] User needs organization setup');
                }
              } else {
                console.error('[AuthContext] Failed to create/fetch profile');
                setAuthError('Failed to load user profile');
              }
            } catch (error) {
              console.error('[AuthContext] Error handling auth state change:', error);
              setAuthError('Authentication error occurred');
            } finally {
              setLoading(false);
            }
          }, 100);
        } else {
          setUserProfile(null);
          setShowOrgSetup(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session check:', session ? 'SIGNED_IN' : 'SIGNED_OUT');
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, fullName: string, companyName: string): Promise<boolean> => {
    try {
      setLoading(true);
      setAuthError(null);
      
      console.log('[AuthContext] Starting signup for:', email);
      
      return await authService.signup(email, password, fullName, companyName);
    } catch (error) {
      console.error('[AuthContext] Signup error:', error);
      toast.error('An error occurred during signup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setAuthError(null);
      
      console.log('[AuthContext] Attempting login for:', email);
      
      return await authService.login(email, password);
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out user');
      setLoading(true);
      
      await authService.logout();
      
      setUserProfile(null);
      setUser(null);
      setSession(null);
      setAuthError(null);
      setShowOrgSetup(false);
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      toast.error('Error during logout');
    } finally {
      setLoading(false);
    }
  };

  const checkRoleAccess = (allowedRoles: string[]): boolean => {
    return profileService.checkRoleAccess(userProfile, allowedRoles);
  };

  const createOrganization = async (name: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error("You must be logged in to create an organization");
      return false;
    }
    
    try {
      console.log('[AuthContext] Creating organization:', name);
      const success = await organizationService.createOrganization(name, user.id);
      
      if (success) {
        // Wait a bit longer and retry profile refresh multiple times if needed
        setTimeout(async () => {
          try {
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
              console.log(`[AuthContext] Refreshing profile attempt ${retryCount + 1}`);
              const updatedProfile = await profileService.fetchUserProfile(user.id);
              
              if (updatedProfile && updatedProfile.org_id) {
                setUserProfile(updatedProfile);
                setShowOrgSetup(false);
                console.log('[AuthContext] Profile refreshed successfully after org creation');
                break;
              }
              
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
            
            if (retryCount === maxRetries) {
              console.warn('[AuthContext] Failed to refresh profile after org creation');
              // Force a page reload as fallback
              window.location.reload();
            }
          } catch (error) {
            console.error('[AuthContext] Error refreshing profile:', error);
            // Force a page reload as fallback
            window.location.reload();
          }
        }, 2000);
      }
      
      return success;
    } catch (error) {
      console.error('[AuthContext] Error creating organization:', error);
      toast.error('Failed to create organization');
      return false;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      console.log('[AuthContext] Refreshing profile for user:', user.id);
      const profile = await profileService.fetchUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
        console.log('[AuthContext] Profile refreshed:', profile.role, profile.org_id ? `(org: ${profile.org_id})` : '(no org)');
        
        // Update org setup visibility using validation utility
        const needsSetup = needsOrganizationSetup(profile);
        setShowOrgSetup(needsSetup);
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing profile:', error);
    }
  };

  const sendInvitation = async (email: string, role: string): Promise<boolean> => {
    return invitationService.sendInvitation(email, role, userProfile, user?.id);
  };

  const acceptInvitation = async (token: string): Promise<boolean> => {
    const success = await invitationService.acceptInvitation(token);
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  const getInvitations = async (): Promise<any[]> => {
    return invitationService.getInvitations(userProfile);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    return authService.resetPassword(email);
  };

  const updatePassword = async (password: string): Promise<boolean> => {
    return authService.updatePassword(password);
  };

  const value: AuthContextType = {
    currentUser: user,
    session,
    userProfile,
    loading,
    authError,
    signup,
    login,
    logout,
    checkRoleAccess,
    createOrganization,
    sendInvitation,
    acceptInvitation,
    getInvitations,
    resetPassword,
    updatePassword,
    refreshProfile
  };

  // Show organization setup if needed
  if (showOrgSetup && userProfile && session) {
    return (
      <AuthContext.Provider value={value}>
        <OrganizationSetup />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
