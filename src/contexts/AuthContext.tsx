
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { authService } from './auth/authService';
import { organizationService } from './auth/organizationService';
import { invitationService } from './auth/invitationService';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  org_id?: string;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, companyName: string) => Promise<boolean>;
  checkRoleAccess: (allowedRoles: string[]) => boolean;
  createOrganization: (name: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  sendInvitation: (email: string, role: string) => Promise<boolean>;
  getInvitations: () => Promise<any[]>;
  acceptInvitation: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Fetch user profile
          const profile = await fetchUserProfile(initialSession.user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Fetch user profile when user logs in
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    return await authService.login(email, password);
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
  };

  const signup = async (email: string, password: string, fullName: string, companyName: string): Promise<boolean> => {
    return await authService.signup(email, password, fullName, companyName);
  };

  const checkRoleAccess = (allowedRoles: string[]): boolean => {
    if (!userProfile) return false;
    
    // System admins have access to everything
    if (userProfile.role === 'system_admin') return true;
    
    // Check if user's role is in the allowed roles
    return allowedRoles.includes(userProfile.role);
  };

  const createOrganization = async (name: string): Promise<boolean> => {
    if (!user?.id) return false;
    return await organizationService.createOrganization(name, user.id);
  };

  const refreshProfile = async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const sendInvitation = async (email: string, role: string): Promise<boolean> => {
    return await invitationService.sendInvitation(email, role, userProfile, user?.id);
  };

  const getInvitations = async (): Promise<any[]> => {
    return await invitationService.getInvitations(userProfile);
  };

  const acceptInvitation = async (token: string): Promise<boolean> => {
    return await invitationService.acceptInvitation(token);
  };

  const value: AuthContextType = {
    session,
    user,
    currentUser: user, // Alias for compatibility
    userProfile,
    loading,
    login,
    logout,
    signup,
    checkRoleAccess,
    createOrganization,
    refreshProfile,
    sendInvitation,
    getInvitations,
    acceptInvitation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
