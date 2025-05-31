
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
      console.log('Fetching team members for org:', orgId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
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

      console.log('Fetched team members:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getTeamMembers:', error);
      throw error;
    }
  },

  async updateMemberRole(memberId: string, newRole: string): Promise<void> {
    try {
      console.log('Updating member role:', memberId, 'to', newRole);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) {
        console.error('Error updating member role:', error);
        throw error;
      }
      
      console.log('Successfully updated member role');
    } catch (error) {
      console.error('Error in updateMemberRole:', error);
      throw error;
    }
  },

  async removeMember(memberId: string): Promise<void> {
    try {
      console.log('Removing member from org:', memberId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ org_id: null, role: 'agent' })
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        throw error;
      }
      
      console.log('Successfully removed member from organization');
    } catch (error) {
      console.error('Error in removeMember:', error);
      throw error;
    }
  }
};
