
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string): Promise<void> => {
    try {
      console.log("Fetching user profile for ID:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116') {
          console.log("Profile not found, creating basic profile");
          const { data: user } = await supabase.auth.getUser();
          
          if (user.user) {
            const { data: insertData, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                full_name: user.user.user_metadata?.full_name || user.user.email || 'User',
                role: 'agent'
              })
              .select()
              .single();
              
            if (!insertError && insertData) {
              setUserProfile({
                id: insertData.id,
                email: user.user.email || '',
                role: insertData.role || 'agent',
                full_name: insertData.full_name,
                org_id: insertData.org_id,
                trial_ends_at: insertData.trial_ends_at
              });
            }
          }
        }
        return;
      }
      
      if (data) {
        const { data: user } = await supabase.auth.getUser();
        setUserProfile({
          id: data.id,
          email: user.user?.email || '',
          role: data.role || 'agent',
          full_name: data.full_name,
          org_id: data.org_id,
          trial_ends_at: data.trial_ends_at
        });
        
        console.log("User profile fetched successfully:", {
          id: data.id,
          role: data.role || 'agent',
          org_id: data.org_id
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Handle authentication state changes
  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (!isMounted) return;

        setSession(newSession);
        setCurrentUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          await fetchUserProfile(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
        
        setLoading(false);
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
          await fetchUserProfile(existingSession.user.id);
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
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login for:", email);
      setLoading(true);
      
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
        
        // Fetch profile and then redirect based on role
        await fetchUserProfile(data.user.id);
        
        // Get the updated profile to determine redirect
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        // Role-based redirect
        if (profileData?.role === 'system_admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
        
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

  // Signup function
  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      console.log("Starting signup process for:", email);
      
      // Validate email format
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
      await fetchUserProfile(currentUser.id);
      
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
            await fetchUserProfile(currentUser.id);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
