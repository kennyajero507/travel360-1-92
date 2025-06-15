
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { AvailableAgent } from '../types/inquiry.types';
import { useAuth } from '../contexts/AuthContext';

export const useInquiryAgents = () => {
  const [availableAgents, setAvailableAgents] = useState<AvailableAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const { profile } = useAuth();

  const isAgent = profile?.role === 'agent';

  useEffect(() => {
    const fetchAgents = async () => {
      if (isAgent) return;

      setLoadingAgents(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'agent')
          .eq('org_id', profile?.org_id);

        if (error) {
          console.error('Error fetching agents:', error);
          return;
        }

        const agents = data?.map(agent => ({
          id: agent.id,
          name: agent.full_name || 'Unknown Agent'
        })) || [];

        setAvailableAgents(agents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoadingAgents(false);
      }
    };

    if (profile?.org_id) {
      fetchAgents();
    }
  }, [profile?.org_id, isAgent]);

  return { availableAgents, loadingAgents, isAgent };
};
