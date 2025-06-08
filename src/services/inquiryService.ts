
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

export class InquiryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InquiryValidationError';
  }
}

export const createInquiry = async (inquiryData: any) => {
  try {
    console.log('[InquiryService] Creating inquiry:', inquiryData);
    
    const { data, error } = await supabase
      .from('inquiries')
      .insert([inquiryData])
      .select()
      .single();

    if (error) {
      console.error('[InquiryService] Error creating inquiry:', error);
      toast.error('Failed to create inquiry');
      throw new InquiryValidationError(error.message);
    }

    console.log('[InquiryService] Inquiry created successfully:', data);
    toast.success('Inquiry created successfully');
    
    return data;
  } catch (error) {
    console.error('[InquiryService] Error in createInquiry:', error);
    if (error instanceof InquiryValidationError) {
      throw error;
    }
    throw new InquiryValidationError('Failed to create inquiry');
  }
};

export const updateInquiry = async (inquiryId: string, updates: any) => {
  try {
    console.log('[InquiryService] Updating inquiry:', inquiryId, updates);
    
    const { data, error } = await supabase
      .from('inquiries')
      .update(updates)
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) {
      console.error('[InquiryService] Error updating inquiry:', error);
      toast.error('Failed to update inquiry');
      throw error;
    }

    console.log('[InquiryService] Inquiry updated successfully:', data);
    toast.success('Inquiry updated successfully');
    
    return data;
  } catch (error) {
    console.error('[InquiryService] Error in updateInquiry:', error);
    throw error;
  }
};

export const deleteInquiry = async (inquiryId: string) => {
  try {
    console.log('[InquiryService] Deleting inquiry:', inquiryId);
    
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', inquiryId);

    if (error) {
      console.error('[InquiryService] Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
      throw error;
    }

    console.log('[InquiryService] Inquiry deleted successfully');
    toast.success('Inquiry deleted successfully');
  } catch (error) {
    console.error('[InquiryService] Error in deleteInquiry:', error);
    throw error;
  }
};

export const getInquiryById = async (id: string): Promise<Inquiry | null> => {
  try {
    console.log('[InquiryService] Fetching inquiry by ID:', id);
    
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
};

export const getInquiriesByTourType = async (tourType: string): Promise<Inquiry[]> => {
  try {
    console.log('[InquiryService] Fetching inquiries by tour type:', tourType);
    
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('tour_type', tourType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[InquiryService] Error fetching inquiries:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[InquiryService] Error in getInquiriesByTourType:', error);
    toast.error('Failed to load inquiries');
    return [];
  }
};

export const getAllInquiries = async (): Promise<Inquiry[]> => {
  try {
    console.log('[InquiryService] Fetching all inquiries');
    
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[InquiryService] Error fetching all inquiries:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[InquiryService] Error in getAllInquiries:', error);
    toast.error('Failed to load inquiries');
    return [];
  }
};

export const assignInquiryToAgent = async (inquiryId: string, agentId: string, agentName: string) => {
  try {
    console.log('[InquiryService] Assigning inquiry to agent:', { inquiryId, agentId, agentName });
    
    const { data, error } = await supabase
      .from('inquiries')
      .update({ 
        assigned_to: agentId,
        assigned_agent_name: agentName,
        status: 'Assigned'
      })
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) {
      console.error('[InquiryService] Error assigning inquiry:', error);
      toast.error('Failed to assign inquiry to agent');
      throw error;
    }

    console.log('[InquiryService] Inquiry assigned successfully:', data);
    toast.success(`Inquiry assigned to ${agentName} successfully`);
    
    return data;
  } catch (error) {
    console.error('[InquiryService] Error in assignInquiryToAgent:', error);
    throw error;
  }
};

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
    return getInquiryById(id);
  }
};
