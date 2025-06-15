import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: any | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: { full_name: string; email: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    };

    getSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });
  }, []);

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the magic link to sign in.');
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const updateProfile = async (profile: { full_name: string; email: string }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          email: profile.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setUser({
        ...user,
        ...data
      });
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

export { AuthContextProvider as AuthProvider };
export default AuthContextProvider;
