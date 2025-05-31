
import { supabase } from '../integrations/supabase/client';

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  org_id: string;
}

export const agentService = {
  async getAgents(orgId: string): Promise<Agent[]> {
    try {
      console.log('Fetching agents for org:', orgId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, org_id')
        .eq('org_id', orgId)
        .in('role', ['agent', 'tour_operator'])
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching agents:', error);
        throw error;
      }

      const agents = (data || []).map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unnamed User',
        email: profile.email || 'No email',
        role: profile.role,
        org_id: profile.org_id
      }));

      console.log('Fetched agents:', agents.length);
      return agents;
    } catch (error) {
      console.error('Error in getAgents:', error);
      throw error;
    }
  }
};
