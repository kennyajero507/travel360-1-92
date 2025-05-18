
import { supabase } from "../integrations/supabase/client";

// Get all inquiries
export const getAllInquiries = async () => {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }
  
  return data || [];
};

// Create a new inquiry
export const createInquiry = async (inquiryData) => {
  // Generate an ID if not provided
  if (!inquiryData.id) {
    inquiryData.id = `I-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
  
  const { data, error } = await supabase
    .from('inquiries')
    .insert(inquiryData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
  
  return data;
};

// Update an inquiry
export const updateInquiry = async (id, updateData) => {
  const { data, error } = await supabase
    .from('inquiries')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating inquiry:', error);
    throw error;
  }
  
  return data;
};

// Get inquiry by ID
export const getInquiryById = async (id) => {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching inquiry:', error);
    throw error;
  }
  
  return data;
};
