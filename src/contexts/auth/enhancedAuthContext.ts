
import { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from './types';

interface EnhancedAuthContextType {
  // Core auth state
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  organization: any | null;
  
  // Loading states
  loading: boolean;
  initializing: boolean;
  
  // Error handling
  error: string | null;
  
  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, options?: any) => Promise<boolean>;
  
  // Profile management
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Workspace management
  initializeWorkspace: () => Promise<boolean>;
  isWorkspaceReady: boolean;
  
  // Debug utilities
  debugAuth: () => Promise<any>;
  systemHealth: {
    database: boolean;
    profile: boolean;
    organization: boolean;
    policies: boolean;
  };
}

export const EnhancedAuthContext = createContext<EnhancedAuthContextType | null>(null);

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};
