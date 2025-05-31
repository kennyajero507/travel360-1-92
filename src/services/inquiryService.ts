import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { InquiryData } from "../types/inquiry.types";

// Get all inquiries
export const getAllInquiries = async () => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to fetch inquiries');
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllInquiries:', error);
    throw error;
  }
};

// Get inquiries by tour type
export const getInquiriesByTourType = async (tourType: 'domestic' | 'international') => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('tour_type', tourType)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching inquiries by tour type:', error);
      toast.error('Failed to fetch inquiries');
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getInquiriesByTourType:', error);
    throw error;
  }
};

// Create a new inquiry
export const createInquiry = async (inquiryData: InquiryData) => {
  try {
    console.log("Creating inquiry with data:", inquiryData);
    
    const { data, error } = await supabase
      .from('inquiries')
      .insert(inquiryData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating inquiry:', error);
      
      // More specific error messages
      if (error.code === '23505') {
        toast.error('An inquiry with this reference already exists');
      } else if (error.code === '23502') {
        toast.error('Required fields are missing');
      } else if (error.code === '42501') {
        toast.error('You do not have permission to create inquiries');
      } else {
        toast.error('Failed to create inquiry. Please check all required fields.');
      }
      throw error;
    }
    
    console.log("Inquiry created successfully:", data);
    return data;
  } catch (error) {
    console.error('Error in createInquiry:', error);
    throw error;
  }
};

// Update an inquiry
export const updateInquiry = async (id: string, updateData: any) => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ 
        ...updateData, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating inquiry:', error);
      toast.error('Failed to update inquiry');
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateInquiry:', error);
    throw error;
  }
};

// Get inquiry by ID
export const getInquiryById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching inquiry:', error);
      toast.error('Failed to fetch inquiry details');
      throw error;
    }
    
    if (!data) {
      toast.error('Inquiry not found');
      throw new Error('Inquiry not found');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getInquiryById:', error);
    throw error;
  }
};

// Assign inquiry to agent
export const assignInquiryToAgent = async (inquiryId: string, agentId: string, agentName: string) => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ 
        assigned_to: agentId,
        assigned_agent_name: agentName,
        status: 'Assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', inquiryId)
      .select()
      .single();
    
    if (error) {
      console.error('Error assigning inquiry:', error);
      toast.error('Failed to assign inquiry');
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in assignInquiryToAgent:', error);
    throw error;
  }
};

// Delete inquiry
export const deleteInquiry = async (id: string) => {
  try {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteInquiry:', error);
    throw error;
  }
};
