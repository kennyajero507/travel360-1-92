import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { organizationService } from './auth/organizationService';
import { invitationService } from './auth/invitationService';
import { profileService } from './auth/profileService';
import { UserProfile, AuthContextType } from './auth/types';
import { ensureUserHasOrganization } from '../utils/fixRLSPolicies';

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
          console.log('User signed in, setting up profile...');
          
          // Use setTimeout to avoid blocking auth state and prevent infinite recursion
          setTimeout(async () => {
            try {
              // Try to get profile with direct query to avoid RLS issues
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (profile) {
                setUserProfile(profile);
                console.log('Profile loaded successfully:', profile.role);
                
                // Ensure user has organization if needed
                if (!profile.org_id && profile.role !== 'system_admin') {
                  console.log('User needs organization, attempting to create...');
                  await ensureUserHasOrganization();
                  
                  // Refresh profile after org creation
                  setTimeout(async () => {
                    const { data: updatedProfile } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('id', session.user.id)
                      .maybeSingle();
                    
                    if (updatedProfile) {
                      setUserProfile(updatedProfile);
                    }
                  }, 1000);
                }
              } else {
                console.error('No profile found, creating fallback');
                // Create fallback profile for immediate access
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
              }
            } catch (error) {
              console.error('Error in profile setup:', error);
              // Create fallback profile on any error
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

  const signup = async (email: string, password: string, fullName: string, companyName: string): Promise<boolean> => {
    try {
      setLoading(true);
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

      if (data.user && !data.session) {
        toast.success('Please check your email to verify your account');
        return true;
      }

      if (data.user && data.session) {
        // Create organization for the new user
        try {
          const orgCreated = await organizationService.createOrganization(companyName, data.user.id);
          if (!orgCreated) {
            console.error('Failed to create organization');
            toast.error('Account created but failed to setup organization');
            return false;
          }
          toast.success('Account created successfully!');
        } catch (orgError) {
          console.error('Organization creation error:', orgError);
          toast.error('Account created but failed to setup organization');
          return false;
        }
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Login failed: ' + error.message);
        return false;
      }

      return true;
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
      await supabase.auth.signOut();
      setUserProfile(null);
      setUser(null);
      setSession(null);
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
    
    try {
      const success = await organizationService.createOrganization(name, user.id);
      if (success) {
        // Refresh profile to get updated org_id
        await refreshProfile();
      }
      return success;
    } catch (error) {
      console.error('Error creating organization:', error);
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
      const profile = await profileService.fetchUserProfile(user.id);
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
