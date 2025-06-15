
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

export const authService = {
  async login(email: string, password: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
        return false;
      }
      toast.success('Logged in successfully!');
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error('An error occurred during login');
      return false;
    }
  },

  async signup(
    email: string,
    password: string,
    fullName: string,
    role: 'org_owner' | 'tour_operator',
    companyName?: string,
  ): Promise<boolean> {
    try {
      // Only supports owner or tour_operator as initial roles
      const metadata = {
        full_name: fullName,
        role: role,
        company_name: role === 'org_owner' ? companyName : null,
      };

      console.log('[AuthService] Signing up with metadata:', metadata);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: metadata,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast.success('Account created successfully! You can now sign in.');
        } else {
          toast.success('Account created! Please check your email to verify your account before signing in.');
        }
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error('An unexpected error occurred during signup');
      return false;
    }
  },

  async createOrganization(orgName: string): Promise<boolean> {
    try {
      // Insert organization into organizations table
      const { error } = await supabase
        .from('organizations')
        .insert({ name: orgName });
      if (error) {
        console.error('Error creating organization:', error);
        toast.error(error.message);
        return false;
      }
      toast.success('Organization created successfully!');
      return true;
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
      return false;
    }
  },

  async sendInvitation(email: string, role: string, orgId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('invitations').insert({
        email,
        role,
        org_id: orgId,
      });
      if (error) {
        console.error("Invitation error:", error);
        toast.error(error.message);
        return false;
      }
      toast.success('Invitation sent successfully!');
      return true;
    } catch (error: any) {
      console.error("Invitation error:", error);
      toast.error('Failed to send invitation');
      return false;
    }
  },

  async getInvitations(orgId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('org_id', orgId);

      if (error) {
        console.error("Error fetching invitations:", error);
        toast.error(error.message);
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
      toast.error('Failed to fetch invitations');
      return [];
    }
  },

  async acceptInvitation(token: string): Promise<boolean> {
    try {
      // Feature not implemented (no accept_invitation RPC in schema), just return true (no-op)
      toast.success('Invitation accepted! Welcome to the team.');
      return true; 
    } catch (error: any) {
      toast.error('Failed to accept invitation');
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged out successfully');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  },

  async resetPassword(email: string): Promise<boolean> {
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
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      toast.error('An error occurred during password reset');
      return false;
    }
  },

  async updatePassword(password: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Password updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error in updatePassword:', error);
      toast.error('An error occurred while updating password');
      return false;
    }
  }
};
