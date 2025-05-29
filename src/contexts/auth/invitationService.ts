
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from './types';

export const invitationService = {
  async sendInvitation(email: string, role: string, userProfile: UserProfile | null, currentUserId: string | undefined): Promise<boolean> {
    try {
      if (!userProfile?.org_id) {
        toast.error("You must be part of an organization to send invitations");
        return false;
      }

      const { error } = await supabase
        .from('invitations')
        .insert({
          email,
          role,
          org_id: userProfile.org_id,
          invited_by: currentUserId
        });

      if (error) {
        console.error("Invitation error:", error);
        toast.error('Failed to send invitation');
        return false;
      }

      toast.success(`Invitation sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('An error occurred while sending invitation');
      return false;
    }
  },

  async acceptInvitation(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('accept_invitation', { invitation_token: token });

      if (error) {
        console.error("Accept invitation error:", error);
        toast.error('Failed to accept invitation');
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; error?: string; org_id?: string; role?: string };
        
        if (result.success) {
          toast.success('Invitation accepted successfully');
          return true;
        } else {
          toast.error(result.error || 'Failed to accept invitation');
          return false;
        }
      } else {
        toast.error('Invalid response from server');
        return false;
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('An error occurred while accepting invitation');
      return false;
    }
  },

  async getInvitations(userProfile: UserProfile | null): Promise<any[]> {
    try {
      if (!userProfile?.org_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('org_id', userProfile.org_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Get invitations error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting invitations:', error);
      return [];
    }
  }
};
