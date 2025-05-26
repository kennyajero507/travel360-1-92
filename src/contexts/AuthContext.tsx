
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  userProfile: { 
    id: string; 
    email: string; 
    role: string; 
    full_name?: string;
    org_id?: string;
    trial_ends_at?: string;
  } | null;
  createOrganization: (name: string) => Promise<boolean>;
  isTrialExpired: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  switchRole: (role: string) => Promise<boolean>;
  getUserRolePermissions: () => Promise<any>;
  checkRoleAccess: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  session: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  userProfile: null,
  createOrganization: async () => false,
  isTrialExpired: async () => false,
  resetPassword: async () => false,
  updatePassword: async () => false,
  switchRole: async () => false,
  getUserRolePermissions: async () => ({}),
  checkRoleAccess: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ 
    id: string; 
    email: string; 
    role: string; 
    full_name?: string;
    org_id?: string;
    trial_ends_at?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (!isMounted) return;

        setSession(newSession);
        setCurrentUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Fetch profile after a short delay to avoid recursion
          setTimeout(() => {
            if (isMounted) {
              fetchUserProfile(newSession.user.id);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
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
          setTimeout(() => {
            if (isMounted) {
              fetchUserProfile(existingSession.user.id);
            }
          }, 100);
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

  // Fetch user profile from the profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      
      // Use direct table query instead of RPC function
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116' || error.message.includes('no rows')) {
          console.log("Profile not found, creating basic profile");
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: currentUser?.user_metadata?.full_name || currentUser?.email || 'User',
              role: 'agent'
            })
            .select()
            .single();
            
          if (!insertError && insertData) {
            setUserProfile({
              id: insertData.id,
              email: currentUser?.email || '',
              role: insertData.role || 'agent',
              full_name: insertData.full_name,
              org_id: insertData.org_id,
              trial_ends_at: insertData.trial_ends_at
            });
          }
        }
        return;
      }
      
      if (data) {
        setUserProfile({
          id: data.id,
          email: currentUser?.email || '',
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

  // Login function
  const login = async (email: string, password: string) => {
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
      
      console.log("Login successful");
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function with proper duplicate email handling
  const signup = async (email: string, password: string, fullName: string) => {
    try {
      console.log("Starting signup process for:", email);
      
      // Validate email format before sending to Supabase
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
      
      // Check if email already exists by attempting to sign up
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
        
        // Handle specific error cases
        if (error.message.includes('already registered') || 
            error.message.includes('User already registered') ||
            error.message.includes('already been registered')) {
          toast.error("This email is already registered. Please use a different email or try signing in.");
          return false;
        }
        
        toast.error(error.message);
        return false;
      }
      
      console.log("Signup response:", data);
      
      // Check if user was created successfully
      if (data.user) {
        // If email confirmation is disabled and user is immediately confirmed
        if (data.user.email_confirmed_at) {
          toast.success("Account created successfully! You can now sign in.");
        } else {
          // If email confirmation is enabled
          toast.success("Please check your email to confirm your account before signing in.");
        }
        return true;
      } else {
        // This case handles when the email already exists but Supabase doesn't return an error
        // This can happen when email confirmations are disabled
        toast.error("This email is already registered. Please use a different email or try signing in.");
        return false;
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
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

  // Create organization and set user as owner
  const createOrganization = async (name: string): Promise<boolean> => {
    try {
      console.log("Creating organization:", name);
      
      if (!currentUser) {
        console.error("No authenticated user found");
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

      setTimeout(() => {
        fetchUserProfile(currentUser.id);
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('An error occurred while creating the organization');
      return false;
    }
  };

  // Check if trial has expired
  const isTrialExpired = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_trial_expired');
      
      if (error) {
        console.error('Error checking trial status:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error in isTrialExpired:', error);
      return false;
    }
  };

  // Password reset request
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

  // Update password after reset
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

  // Role switching for admin users
  const switchRole = async (role: string): Promise<boolean> => {
    try {
      // Only system admins can change their role
      if (!currentUser || !userProfile || userProfile.role !== 'system_admin') {
        return false;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', currentUser.id);
      
      if (error) {
        toast.error(`Failed to switch role: ${error.message}`);
        return false;
      }
      
      // Update local state
      setUserProfile(prev => prev ? {...prev, role} : null);
      toast.success(`Role switched to ${role}`);
      return true;
    } catch (error) {
      console.error('Error in switchRole:', error);
      toast.error('An error occurred while switching roles');
      return false;
    }
  };

  // Get user role permissions based on their role and subscription tier
  const getUserRolePermissions = async () => {
    try {
      if (!userProfile) return null;
      
      let tier = 'starter';
      if (userProfile.org_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('subscription_status')
          .eq('id', userProfile.org_id)
          .single();
          
        if (orgData) {
          tier = orgData.subscription_status;
        }
      }
      
      const permissions = {
        system_admin: {
          canManageAllOrgs: true,
          canManageSubscription: true,
          canManageTeam: true,
          canManageHotels: true,
          canAssignAgents: true,
          canCreateQuotes: true,
          maxTeamMembers: Infinity,
        },
        org_owner: {
          canManageAllOrgs: false,
          canManageSubscription: true,
          canManageTeam: true,
          canManageHotels: true,
          canAssignAgents: true,
          canCreateQuotes: true,
          maxTeamMembers: tier === 'starter' ? 5 : tier === 'pro' ? 25 : 100,
        },
        tour_operator: {
          canManageAllOrgs: false,
          canManageSubscription: false,
          canManageTeam: false,
          canManageHotels: true,
          canAssignAgents: true,
          canCreateQuotes: true,
          maxTeamMembers: 0,
        },
        agent: {
          canManageAllOrgs: false,
          canManageSubscription: false,
          canManageTeam: false,
          canManageHotels: false,
          canAssignAgents: false,
          canCreateQuotes: true,
          maxTeamMembers: 0,
        },
        client: {
          canManageAllOrgs: false,
          canManageSubscription: false,
          canManageTeam: false,
          canManageHotels: false,
          canAssignAgents: false,
          canCreateQuotes: false,
          maxTeamMembers: 0,
        }
      };
      
      return permissions[userProfile.role as keyof typeof permissions] || permissions.client;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return null;
    }
  };

  // Check if user role is included in allowed roles
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
    login,
    signup,
    logout,
    userProfile,
    createOrganization,
    isTrialExpired,
    resetPassword,
    updatePassword,
    switchRole,
    getUserRolePermissions,
    checkRoleAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
