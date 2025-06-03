import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { organizationService } from './auth/organizationService';
import { invitationService } from './auth/invitationService';
import { profileService } from './auth/profileService';
import { UserProfile, AuthContextType } from './auth/types';

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

  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', event, session ? 'HAS_SESSION' : 'NO_SESSION');
        
        setSession(session);
        setUser(session?.user ?? null);
        setAuthError(null);
        
        if (session?.user) {
          console.log('[AuthContext] User signed in, fetching profile...');
          
          // Use setTimeout to prevent potential recursion and allow state to settle
          setTimeout(async () => {
            try {
              setLoading(true);
              const profile = await profileService.ensureProfileExists(session.user.id);
              
              if (profile) {
                setUserProfile(profile);
                console.log('[AuthContext] Profile loaded:', profile.role, profile.org_id ? `(org: ${profile.org_id})` : '(no org)');
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
          setLoading(false);
        }
      }
    );

    // Check for existing session
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
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            company_name: companyName,
            role: 'org_owner'
          }
        }
      });

      if (error) {
        console.error('[AuthContext] Signup error:', error);
        
        if (error.message.includes('already registered') || 
            error.message.includes('User already registered')) {
          toast.error("This email is already registered. Please use a different email or try signing in.");
        } else {
          toast.error('Failed to create account: ' + error.message);
        }
        return false;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          console.log('[AuthContext] Signup successful with immediate session');
          toast.success('Account created successfully!');
        } else {
          console.log('[AuthContext] Signup successful - email verification required');
          toast.success('Please check your email to verify your account before signing in');
        }
        return true;
      }

      return true;
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('[AuthContext] Login error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else {
          toast.error('Login failed: ' + error.message);
        }
        return false;
      }

      if (data.user) {
        console.log('[AuthContext] Login successful for user:', data.user.id);
        toast.success('Logged in successfully');
        return true;
      }

      return false;
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
      
      await supabase.auth.signOut();
      
      setUserProfile(null);
      setUser(null);
      setSession(null);
      setAuthError(null);
      
      toast.success('Logged out successfully');
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
        // Refresh profile to get updated org_id
        setTimeout(async () => {
          try {
            const updatedProfile = await profileService.fetchUserProfile(user.id);
            if (updatedProfile) {
              setUserProfile(updatedProfile);
              console.log('[AuthContext] Profile refreshed after org creation');
            }
          } catch (error) {
            console.error('[AuthContext] Error refreshing profile:', error);
          }
        }, 1000);
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
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('[AuthContext] Reset password error:', error);
        toast.error('Failed to send reset email');
        return false;
      }

      toast.success('Password reset email sent');
      return true;
    } catch (error) {
      console.error('[AuthContext] Reset password error:', error);
      toast.error('An error occurred while sending reset email');
      return false;
    }
  };

  const updatePassword = async (password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        console.error('[AuthContext] Update password error:', error);
        toast.error('Failed to update password');
        return false;
      }

      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      console.error('[AuthContext] Update password error:', error);
      toast.error('An error occurred while updating password');
      return false;
    }
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
