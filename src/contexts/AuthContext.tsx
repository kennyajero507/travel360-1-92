
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
        setSession(newSession);
        setCurrentUser(newSession?.user ?? null);
        
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        // Check if trial has expired for org owners
        if (data.role === 'org_owner' && data.org_id) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('subscription_status, trial_end')
            .eq('id', data.org_id)
            .single();
            
          const isExpired = orgData?.trial_end && new Date(orgData.trial_end) < new Date();
          if (isExpired && orgData?.subscription_status === 'trial') {
            // Update subscription status to expired
            await supabase
              .from('organizations')
              .update({ subscription_status: 'expired' })
              .eq('id', data.org_id);
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
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Logged in successfully');
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
        toast.error(error.message);
        return false;
      }
      
      toast.success('Sign up successful! Please check your email for verification.');
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
      const { data, error } = await supabase
        .rpc('create_organization', { org_name: name });

      if (error) {
        toast.error('Failed to create organization: ' + error.message);
        return false;
      }

      // Refresh user profile to get the updated role
      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      }
      
      toast.success('Organization created successfully!');
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
