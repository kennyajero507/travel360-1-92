
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  org_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkRoleAccess: (allowedRoles: string[]) => boolean;
}

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
  const maxRetries = 4;
  
  try {
    console.log(`Fetching user profile for ID: ${userId} (attempt ${attempt})`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    if (data) {
      console.log('Successfully fetched user profile:', data);
      return data;
    }

    console.log('No profile found, creating fallback profile');
    return null;
  } catch (error) {
    console.error(`Error in fetchUserProfile (attempt ${attempt}):`, error);
    
    if (attempt < maxRetries) {
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

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const checkRoleAccess = (allowedRoles: string[]): boolean => {
    if (!userProfile?.role) return false;
    return allowedRoles.includes(userProfile.role);
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    checkRoleAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
