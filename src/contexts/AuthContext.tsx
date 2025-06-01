
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

// Separate function to fetch profile with retry logic
const fetchUserProfile = async (userId: string, attempt = 1): Promise<UserProfile | null> => {
  try {
    const profile = await profileService.fetchUserProfile(userId, attempt - 1);
    return profile;
  } catch (error) {
    console.error(`Error in fetchUserProfile (attempt ${attempt}):`, error);
    
    if (attempt < 3) {
      const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
      console.log(`Retrying profile fetch in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchUserProfile(userId, attempt + 1);
    }
    
    console.log('All retries failed, creating fallback profile');
    return null;
  }
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
          // Defer profile fetching to avoid blocking auth state
          setTimeout(async () => {
            try {
              const profile = await fetchUserProfile(session.user.id);
              if (profile) {
                setUserProfile(profile);
              } else {
                // Create fallback profile if none exists
                console.log('Creating fallback profile');
                const fallbackProfile: UserProfile = {
                  id: session.user.id,
                  full_name: session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: 'org_owner', // Default role for new users
                  org_id: null,
                  trial_ends_at: null,
                  created_at: new Date().toISOString()
                };
                setUserProfile(fallbackProfile);
              }
            } catch (error) {
              console.error('Failed to fetch profile, using fallback');
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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signup = async (email: string, password: string, fullName: string, companyName: string): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error('Failed to create account: ' + error.message);
        return false;
      }

      if (data.user) {
        // Create organization for the new user
        const orgCreated = await organizationService.createOrganization(companyName, data.user.id);
        if (!orgCreated) {
          console.error('Failed to create organization');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
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
    return organizationService.createOrganization(name, user.id);
  };

  const sendInvitation = async (email: string, role: string): Promise<boolean> => {
    return invitationService.sendInvitation(email, role, userProfile, user?.id);
  };

  const acceptInvitation = async (token: string): Promise<boolean> => {
    return invitationService.acceptInvitation(token);
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
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
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
