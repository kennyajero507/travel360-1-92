
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getDefaultRedirectPath } from '../utils/authHelpers';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  org_id?: string;
  trial_ends_at?: string;
}

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  createOrganization: (name: string) => Promise<boolean>;
  sendInvitation: (email: string, role: string) => Promise<boolean>;
  acceptInvitation: (token: string) => Promise<boolean>;
  getInvitations: () => Promise<any[]>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  checkRoleAccess: (allowedRoles: string[]) => boolean;
  refreshProfile: () => Promise<void>;
}

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

  // Fetch user profile with timeout and retry logic
  const fetchUserProfile = async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    const maxRetries = 3;
    const timeout = 5000; // 5 seconds
    
    try {
      console.log(`Fetching user profile for ID: ${userId} (attempt ${retryCount + 1})`);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), timeout);
      });
      
      // Race between the actual query and timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);
      
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (!data) {
        console.log("No profile found for user, creating fallback profile");
        // Create a fallback profile if none exists
        return {
          id: userId,
          email: currentUser?.email || '',
          role: 'agent',
          full_name: currentUser?.user_metadata?.full_name || null,
        };
      }
      
      const { data: user } = await supabase.auth.getUser();
      const profile: UserProfile = {
        id: data.id,
        email: user.user?.email || '',
        role: data.role || 'agent',
        full_name: data.full_name,
        org_id: data.org_id,
        trial_ends_at: data.trial_ends_at
      };
      
      console.log("User profile fetched successfully:", {
        id: profile.id,
        role: profile.role,
        org_id: profile.org_id
      });
      
      return profile;
    } catch (error) {
      console.error(`Error in fetchUserProfile (attempt ${retryCount + 1}):`, error);
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying profile fetch in ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return fetchUserProfile(userId, retryCount + 1);
      }
      
      // If all retries failed, create a fallback profile
      console.log("All retries failed, creating fallback profile");
      return {
        id: userId,
        email: currentUser?.email || '',
        role: 'agent',
        full_name: currentUser?.user_metadata?.full_name || null,
      };
    }
  };

  // Refresh profile function
  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await fetchUserProfile(currentUser.id);
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
              const profile = await fetchUserProfile(newSession.user.id);
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
          const profile = await fetchUserProfile(existingSession.user.id);
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

  // Login function with better error handling
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        console.log("Login successful");
        toast.success('Logged in successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      console.log("Starting signup process for:", email);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        
        if (error.message.includes('already registered') || 
            error.message.includes('User already registered')) {
          toast.error("This email is already registered. Please use a different email or try signing in.");
          return false;
        }
        
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast.success("Account created successfully! You can now sign in.");
        } else {
          toast.success("Please check your email to confirm your account before signing in.");
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  // Create organization
  const createOrganization = async (name: string): Promise<boolean> => {
    try {
      console.log("Creating organization:", name);
      
      if (!currentUser) {
        toast.error("You must be logged in to create an organization");
        return false;
      }
      
      const { data, error } = await supabase
        .rpc('create_organization', { org_name: name });

      if (error) {
        console.error("Organization creation error:", error);
        toast.error('Failed to create organization: ' + error.message);
        return false;
      }

      console.log("Organization created with ID:", data);

      // Update organization with owner_id
      await supabase
        .from('organizations')
        .update({ owner_id: currentUser.id })
        .eq('id', data);

      // Refresh user profile
      await refreshProfile();
      
      return true;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('An error occurred while creating the organization');
      return false;
    }
  };

  // Send invitation
  const sendInvitation = async (email: string, role: string): Promise<boolean> => {
    try {
      if (!userProfile?.org_id) {
        toast.error("You must be part of an organization to send invitations");
        return false;
      }

      const { error } = await supabase
        .from('invitations')
        .insert({
          email,
          role,
          org_id: userProfile.org_id,
          invited_by: currentUser?.id
        });

      if (error) {
        console.error("Invitation error:", error);
        toast.error('Failed to send invitation');
        return false;
      }

      toast.success(`Invitation sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('An error occurred while sending invitation');
      return false;
    }
  };

  // Accept invitation
  const acceptInvitation = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('accept_invitation', { invitation_token: token });

      if (error) {
        console.error("Accept invitation error:", error);
        toast.error('Failed to accept invitation');
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; error?: string; org_id?: string; role?: string };
        
        if (result.success) {
          toast.success('Invitation accepted successfully');
          if (currentUser) {
            await refreshProfile();
          }
          return true;
        } else {
          toast.error(result.error || 'Failed to accept invitation');
          return false;
        }
      } else {
        toast.error('Invalid response from server');
        return false;
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('An error occurred while accepting invitation');
      return false;
    }
  };

  // Get invitations
  const getInvitations = async (): Promise<any[]> => {
    try {
      if (!userProfile?.org_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('org_id', userProfile.org_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Get invitations error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting invitations:', error);
      return [];
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Password reset email sent. Please check your inbox.');
      return true;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      toast.error('An error occurred during password reset');
      return false;
    }
  };

  // Update password
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
      console.error('Error in updatePassword:', error);
      toast.error('An error occurred while updating password');
      return false;
    }
  };

  // Check role access
  const checkRoleAccess = (allowedRoles: string[]): boolean => {
    if (!userProfile) return false;
    
    // Always grant access to system admins
    if (userProfile.role === 'system_admin') return true;
    
    return allowedRoles.includes(userProfile.role);
  };

  const value = {
    currentUser,
    session,
    loading,
    userProfile,
    login,
    signup,
    logout,
    createOrganization,
    sendInvitation,
    acceptInvitation,
    getInvitations,
    resetPassword,
    updatePassword,
    checkRoleAccess,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
