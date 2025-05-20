
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

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

// Create a new inquiry
export const createInquiry = async (inquiryData: any) => {
  try {
    // Generate an ID if not provided
    if (!inquiryData.id) {
      inquiryData.id = `I-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
    
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    // Set created_by if user is authenticated
    if (user) {
      inquiryData.created_by = user.id;
    }
    
    const { data, error } = await supabase
      .from('inquiries')
      .insert(inquiryData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating inquiry:', error);
      toast.error('Failed to create inquiry');
      throw error;
    }
    
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
