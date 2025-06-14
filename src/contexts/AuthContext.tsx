import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { enhancedAuthService } from './auth/enhancedAuthService';
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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | undefined;

    async function initialize() {
      setLoading(true);
      setAuthError(null);

      // Listen for auth state changes FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, sess) => {
          if (!isMounted) return;
          setSession(sess);
          setUser(sess?.user ?? null);
          if (!sess) {
            setUserProfile(null);
            setLoading(false);
          }
        }
      );

      try {
        timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            setLoading(false);
            setAuthError("Authentication is taking too long. Please try signing in again.");
          }
        }, 3000);

        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          setAuthError("Could not check authentication session.");
          setLoading(false);
        }
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          try {
            const profile = await profileService.ensureProfileExists(
              initialSession.user.id,
              initialSession.user.email || ""
            );
            setUserProfile(profile);
          } catch (err) {
            setAuthError('Failed to fetch user profile.');
            setUserProfile(null);
          }
        }
      } catch (err) {
        setAuthError('Unexpected error during auth initialization.');
        setLoading(false);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
      }

      return () => {
        isMounted = false;
        if (timeoutId) clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    }

    initialize();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[AuthContext] Login attempt for:', email);
    
    try {
      const success = await enhancedAuthService.login(email, password);
      console.log('[AuthContext] Login result:', success);
      return success;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('[AuthContext] Logout initiated');
    await enhancedAuthService.logout();
  };

  const signup = async (email: string, password: string, fullName: string, companyName: string): Promise<boolean> => {
    console.log('[AuthContext] Signup attempt for:', email);
    return await enhancedAuthService.signup(email, password, fullName, companyName);
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
      const profile = await profileService.ensureProfileExists(user.id, user.email ?? undefined);
      setUserProfile(profile);
      setAuthError(null);
    } catch (err) {
      setAuthError('Could not refresh profile.');
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
    return await enhancedAuthService.resetPassword(email);
  };

  const updatePassword = async (password: string): Promise<boolean> => {
    return await enhancedAuthService.updatePassword(password);
  };

  const value: AuthContextType = {
    session,
    currentUser: user,
    userProfile,
    loading,
    authError,
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

  // Basic fatal error boundary
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700">
        <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
        <p>{authError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <span className="text-slate-500 text-lg">Loading authentication...</span>
        </div>
      ) : (
        children
      )}
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
