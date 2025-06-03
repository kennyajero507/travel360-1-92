
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  org_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

export interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError?: string | null;
  signup: (email: string, password: string, fullName: string, companyName: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkRoleAccess: (allowedRoles: string[]) => boolean;
  createOrganization: (name: string) => Promise<boolean>;
  sendInvitation: (email: string, role: string) => Promise<boolean>;
  acceptInvitation: (token: string) => Promise<boolean>;
  getInvitations: () => Promise<any[]>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}
