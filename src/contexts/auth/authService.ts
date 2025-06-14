
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

export const authService = {
  async login(email: string, password: string): Promise<boolean> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login error:", error);
      toast.error(error.message);
      return false;
    }
    toast.success('Logged in successfully!');
    return true;
  },

  async signup(
    email: string,
    password: string,
    fullName: string,
    role: 'org_owner' | 'tour_operator',
    companyName?: string,
  ): Promise<boolean> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: fullName,
          company_name: role === 'org_owner' ? companyName : null,
          role: role,
        },
      },
    });

    if (error) {
      console.error("Signup error:", error);
      toast.error(error.message);
      return false;
    }

    if (data.user) {
      toast.success('Account created! Please check your email to verify your account.');
      // NOTE: Organization is not created here. That should happen after the user's first login.
      return true;
    }

    return false;
  },

  async createOrganization(orgName: string): Promise<boolean> {
    const { error } = await supabase.rpc('create_organization', { org_name: orgName });
    if (error) {
      console.error('Error creating organization:', error);
      toast.error(error.message);
      return false;
    }
    toast.success('Organization created successfully! Reloading...');
    return true;
  },

  async sendInvitation(email: string, role: string, orgId: string): Promise<boolean> {
    // This function assumes an 'invitations' table exists with columns:
    // email, role, org_id, and that appropriate RLS policies are in place.
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
  },

  async getInvitations(orgId: string): Promise<any[]> {
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
  },

  async acceptInvitation(token: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('accept_invitation', { invitation_token: token });
    
    if (error || (data && (data as any).success === false)) {
      const errorMessage = error?.message || (data as any)?.error || 'Failed to accept invitation.';
      console.error('Error accepting invitation:', errorMessage);
      toast.error(errorMessage);
      return false;
    }

    toast.success('Invitation accepted! Welcome to the team.');
    return true;
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out successfully');
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
    } catch (error) {
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
    } catch (error) {
      console.error('Error in updatePassword:', error);
      toast.error('An error occurred while updating password');
      return false;
    }
  }
};
