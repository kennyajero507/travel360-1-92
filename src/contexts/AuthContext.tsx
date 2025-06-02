
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User signed in, fetching profile...');
          
          // Use setTimeout to prevent blocking and avoid potential recursion
          setTimeout(async () => {
            try {
              const profile = await profileService.fetchUserProfile(session.user.id);
              if (profile) {
                setUserProfile(profile);
                console.log('Profile loaded:', profile.role, profile.org_id ? `(org: ${profile.org_id})` : '(no org)');
                
                // If user doesn't have an organization and is org_owner, create one
                if (!profile.org_id && profile.role === 'org_owner') {
                  console.log('Organization owner needs an organization');
                  // Don't auto-create here, let the user do it through the UI
                }
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              // Create minimal fallback profile to prevent auth blocking
              const fallbackProfile: UserProfile = {
                id: session.user.id,
                full_name: session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: 'org_owner',
                org_id: null,
                trial_ends_at: null,
                created_at: new Date().toISOString()
              };
              setUserProfile(fallbackProfile);
              console.log('Using fallback profile');
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
      console.log('Initial session check:', session ? 'SIGNED_IN' : 'SIGNED_OUT');
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email: string, password: string, fullName: string, companyName: string): Promise<boolean> => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      console.log('Starting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            company_name: companyName
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error('Failed to create account: ' + error.message);
        return false;
      }

      if (data.user && !data.session) {
        console.log('Signup successful - email verification required');
        toast.success('Please check your email to verify your account before signing in');
        return true;
      }

      if (data.user && data.session) {
        console.log('Signup successful with immediate session');
        // Profile should be created automatically by trigger
        // Organization will be created when user first logs in or manually
        toast.success('Account created successfully!');
        return true;
      }

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Login failed: ' + error.message);
        return false;
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        toast.success('Logged in successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await supabase.auth.signOut();
      setUserProfile(null);
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
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
      console.log('Creating organization:', name);
      const success = await organizationService.createOrganization(name, user.id);
      if (success) {
        // Refresh profile to get updated org_id
        await refreshProfile();
        toast.success('Organization created successfully!');
      }
      return success;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
      return false;
    }
  };

  const sendInvitation = async (email: string, role: string): Promise<boolean> => {
    return invitationService.sendInvitation(email, role, userProfile, user?.id);
  };

  const acceptInvitation = async (token: string): Promise<boolean> => {
    const success = await invitationService.acceptInvitation(token);
    if (success) {
      // Refresh profile to get updated org_id and role
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
        console.error('Reset password error:', error);
        toast.error('Failed to send reset email');
        return false;
      }

      toast.success('Password reset email sent');
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
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
        console.error('Update password error:', error);
        toast.error('Failed to update password');
        return false;
      }

      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      toast.error('An error occurred while updating password');
      return false;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      console.log('Refreshing profile for user:', user.id);
      const profile = await profileService.fetchUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
        console.log('Profile refreshed:', profile.role, profile.org_id ? `(org: ${profile.org_id})` : '(no org)');
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value: AuthContextType = {
    currentUser: user,
    session,
    userProfile,
    loading,
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
