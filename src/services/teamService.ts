
import { supabase } from '../integrations/supabase/client';

export interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  org_id: string | null;
  created_at: string;
}

export const teamService = {
  async getTeamMembers(orgId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          org_id,
          created_at
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      // Get email addresses from auth.users through a separate query
      const memberIds = data?.map(member => member.id) || [];
      const membersWithEmails: TeamMember[] = [];

      for (const member of data || []) {
        // For now, we'll use a placeholder email since we can't directly query auth.users
        // In a real implementation, this would be handled by an edge function
        membersWithEmails.push({
          ...member,
          email: 'user@example.com' // Placeholder - would need edge function to get real email
        });
      }

      return membersWithEmails;
    } catch (error) {
      console.error('Error in getTeamMembers:', error);
      throw error;
    }
  },

  async updateMemberRole(memberId: string, newRole: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) {
        console.error('Error updating member role:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateMemberRole:', error);
      throw error;
    }
  },

  async removeMember(memberId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ org_id: null })
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in removeMember:', error);
      throw error;
    }
  }
};
