import { useState, useEffect } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import type { QuoteFormData, SleepingArrangement, TransportOption, TransferOption, Activity } from '../types/quote';

export const useQuoteForm = (inquiryId?: string) => {
  const { profile } = useSimpleAuth();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loadingInquiry, setLoadingInquiry] = useState(!!inquiryId);
  const [orgSettings, setOrgSettings] = useState<any>(null);

  const [formData, setFormData] = useState<QuoteFormData>({
    selected_hotel_id: '',
    markup_percentage: 15,
    valid_until: '',
    notes: '',
    currency_code: 'USD'
  });

  const [sleepingArrangements, setSleepingArrangements] = useState<SleepingArrangement[]>([]);
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [transferOptions, setTransferOptions] = useState<TransferOption[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchInquiry = async () => {
    if (!inquiryId) return;

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('id', inquiryId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Inquiry not found');
        return;
      }

      setInquiry(data);

      // Initialize sleeping arrangements
      const arrangements: SleepingArrangement[] = [];
      for (let i = 1; i <= (data.num_rooms || 1); i++) {
        arrangements.push({
          id: `room_${i}`,
          room_number: i,
          adults: Math.floor((data.adults || 1) / (data.num_rooms || 1)),
          children_with_bed: Math.floor((data.children_with_bed || 0) / (data.num_rooms || 1)),
          children_no_bed: Math.floor((data.children_no_bed || 0) / (data.num_rooms || 1)),
          room_type: '',
          cost_per_night: 0
        });
      }
      setSleepingArrangements(arrangements);
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      toast.error('Failed to load inquiry data');
    } finally {
      setLoadingInquiry(false);
    }
  };

  const fetchOrganizationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('org_id', profile?.org_id)
        .maybeSingle();

      if (error) throw error;

      setOrgSettings(data);

      // Set default currency from organization settings
      if (data?.default_currency) {
        setFormData(prev => ({
          ...prev,
          currency_code: data.default_currency
        }));
      }
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      // Use USD as fallback
      setFormData(prev => ({ ...prev, currency_code: 'USD' }));
    }
  };

  // Set default valid until date
  useEffect(() => {
    const defaultValidUntil = new Date();
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      valid_until: defaultValidUntil.toISOString().split('T')[0]
    }));
  }, []);

  useEffect(() => {
    if (inquiryId && profile?.org_id) {
      fetchInquiry();
      fetchOrganizationSettings();
    } else if (profile?.org_id) {
      fetchOrganizationSettings();
    }
  }, [inquiryId, profile?.org_id]);

  const handleFormDataChange = (field: keyof QuoteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    inquiry,
    loadingInquiry,
    orgSettings,
    formData,
    sleepingArrangements,
    transportOptions,
    transferOptions,
    activities,
    setSleepingArrangements,
    setTransportOptions,
    setTransferOptions,
    setActivities,
    handleFormDataChange,
    setFormData
  };
};