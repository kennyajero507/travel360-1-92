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
    // Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        // Update session in state
        setSession(newSession);
        setCurrentUser(newSession?.user ?? null);
        
        // Store session in localStorage for persistence if needed
        if (event === 'SIGNED_IN' && newSession) {
          localStorage.setItem('supabase.auth.token', JSON.stringify(newSession));
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('supabase.auth.token');
        }
        
        // If user changes, fetch their profile
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setCurrentUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Fetch user profile from the profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      
      // First fetch the profile directly without joining organizations
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        // If we have an org_id, fetch organization details separately
        let orgData = null;
        if (data.org_id) {
          const { data: orgResult, error: orgError } = await supabase
            .from('organizations')
            .select('subscription_status, trial_end')
            .eq('id', data.org_id)
            .single();
            
          if (!orgError) {
            orgData = orgResult;
            
            const isExpired = orgData?.trial_end && new Date(orgData.trial_end) < new Date();
            if (isExpired && orgData?.subscription_status === 'trial') {
              // Update subscription status to expired
              await supabase
                .from('organizations')
                .update({ subscription_status: 'expired' })
                .eq('id', data.org_id);
            }
          } else {
            console.error('Error fetching organization:', orgError);
          }
        }
        
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

  // Login function - configured for persistent sessions
  const login = async (email: string, password: string) => {
    try {
      // Use signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, fullName: string) => {
    try {
      console.log("Starting signup process for:", email);
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
        toast.error(error.message);
        return false;
      }
      
      console.log("Signup successful:", data);
      
      if (data.user) {
        // Wait for a moment to ensure the profile is created by the trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchUserProfile(data.user.id);
      }
      
      return true;
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
      
      // Call the RPC function to create an organization
      const { data, error } = await supabase
        .rpc('create_organization', { org_name: name });

      if (error) {
        console.error("Organization creation error:", error);
        toast.error('Failed to create organization: ' + error.message);
        return false;
      }

      console.log("Organization created with ID:", data);

      // Refresh user profile to get the updated role
      await fetchUserProfile(currentUser.id);
      
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
      
      // Get organization subscription tier
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
      
      // Define role-based permissions
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
