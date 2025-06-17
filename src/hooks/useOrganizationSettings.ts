
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface OrganizationSettings {
  org_id: string;
  default_country: string;
  default_currency: string;
  default_regions: string[];
}

export const useOrganizationSettings = () => {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!profile?.org_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('organization_settings')
          .select('*')
          .eq('org_id', profile.org_id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching organization settings:', error);
          // Create default settings if none exist
          const { data: newSettings, error: insertError } = await supabase
            .from('organization_settings')
            .insert({
              org_id: profile.org_id,
              default_country: 'Kenya',
              default_currency: 'KES',
              default_regions: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']
            })
            .select()
            .single();

          if (!insertError && newSettings) {
            setSettings(newSettings);
          }
        } else if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error with organization settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [profile?.org_id]);

  return { settings, loading };
};
