
import { supabase } from "@/integrations/supabase/client";
import { InquiryData, InquiryInsertData } from "@/types/inquiry.types";
import { InquiryValidationError } from "./errors";

export const createInquiry = async (inquiryData: InquiryInsertData) => {
  console.log('[InquiryService] Creating inquiry:', inquiryData);
  
  const { data, error } = await supabase
    .from('inquiries')
    .insert([inquiryData])
    .select()
    .single();

  if (error) {
    console.error('[InquiryService] Error creating inquiry:', error);
    throw new InquiryValidationError(error.message);
  }

  console.log('[InquiryService] Inquiry created successfully:', data);
  return data;
};

export const updateInquiry = async (inquiryId: string, updates: Partial<InquiryData>) => {
  console.log('[InquiryService] Updating inquiry:', inquiryId, updates);
  
  const { data, error } = await supabase
    .from('inquiries')
    .update(updates)
    .eq('id', inquiryId)
    .select()
    .single();

  if (error) {
    console.error('[InquiryService] Error updating inquiry:', error);
    throw error;
  }

  console.log('[InquiryService] Inquiry updated successfully:', data);
  return data;
};

export const deleteInquiry = async (inquiryId: string) => {
  console.log('[InquiryService] Deleting inquiry:', inquiryId);
  
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', inquiryId);

  if (error) {
    console.error('[InquiryService] Error deleting inquiry:', error);
    throw error;
  }

  console.log('[InquiryService] Inquiry deleted successfully');
};

export const getInquiryById = async (id: string): Promise<InquiryData | null> => {
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
};

export const getInquiriesByTourType = async (tourType: string): Promise<InquiryData[]> => {
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
};

export const getAllInquiries = async (): Promise<InquiryData[]> => {
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
};

export const assignInquiryToAgent = async (inquiryId: string, agentId: string, agentName: string) => {
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
    throw error;
  }

  console.log('[InquiryService] Inquiry assigned successfully:', data);
  return data;
};

export const getAvailableInquiries = async (): Promise<InquiryData[]> => {
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
};
