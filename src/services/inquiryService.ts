
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

export interface Inquiry {
  id: string;
  enquiry_number: string;
  client_name: string;
  client_email?: string;
  client_mobile: string;
  destination: string;
  custom_destination?: string;
  package_name?: string;
  custom_package?: string;
  tour_type: string;
  check_in_date: string;
  check_out_date: string;
  days_count?: number;
  nights_count?: number;
  adults: number;
  children: number;
  infants: number;
  num_rooms?: number;
  status: string;
  priority?: string;
  description?: string;
  lead_source?: string;
  tour_consultant?: string;
  assigned_to?: string;
  assigned_agent_name?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const inquiryService = {
  async getAvailableInquiries(): Promise<Inquiry[]> {
    try {
      console.log('[InquiryService] Fetching available inquiries for quotes');
      
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .in('status', ['New', 'Assigned'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[InquiryService] Error fetching inquiries:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[InquiryService] Error in getAvailableInquiries:', error);
      toast.error('Failed to load available inquiries');
      return [];
    }
  },

  async getInquiryById(id: string): Promise<Inquiry | null> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[InquiryService] Error fetching inquiry:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[InquiryService] Error in getInquiryById:', error);
      return null;
    }
  }
};
