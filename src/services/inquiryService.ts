
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { InquiryInsertData, InquiryData } from "../types/inquiry.types";

export const createInquiry = async (inquiryData: InquiryInsertData): Promise<InquiryData> => {
  console.log("Creating inquiry with data:", inquiryData);
  
  try {
    // Ensure the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Prepare the data for insertion - explicitly structure the data for Supabase
    const insertData = {
      id: inquiryData.id,
      tour_type: inquiryData.tour_type,
      lead_source: inquiryData.lead_source,
      tour_consultant: inquiryData.tour_consultant,
      client_name: inquiryData.client_name,
      client_email: inquiryData.client_email,
      client_mobile: inquiryData.client_mobile,
      destination: inquiryData.destination,
      package_name: inquiryData.package_name,
      custom_package: inquiryData.custom_package,
      custom_destination: inquiryData.custom_destination,
      description: inquiryData.description,
      check_in_date: inquiryData.check_in_date,
      check_out_date: inquiryData.check_out_date,
      adults: inquiryData.adults,
      children: inquiryData.children,
      infants: inquiryData.infants,
      num_rooms: inquiryData.num_rooms,
      priority: inquiryData.priority,
      assigned_to: inquiryData.assigned_to,
      assigned_agent_name: inquiryData.assigned_agent_name,
      created_by: user.id,
      status: inquiryData.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("Inserting inquiry data:", insertData);

    const { data, error } = await supabase
      .from('inquiries')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Database error creating inquiry:", error);
      toast.error(`Failed to create inquiry: ${error.message}`);
      throw error;
    }

    console.log("Successfully created inquiry:", data);
    toast.success("Inquiry created successfully");
    return data;
  } catch (error) {
    console.error("Error in createInquiry:", error);
    if (error instanceof Error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.error("Failed to create inquiry");
    }
    throw error;
  }
};

export const updateInquiry = async (id: string, inquiryData: Partial<InquiryInsertData>): Promise<InquiryData> => {
  console.log("Updating inquiry:", id, inquiryData);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const updateData = {
      ...inquiryData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inquiry:", error);
      toast.error(`Failed to update inquiry: ${error.message}`);
      throw error;
    }

    toast.success("Inquiry updated successfully");
    return data;
  } catch (error) {
    console.error("Error in updateInquiry:", error);
    throw error;
  }
};

export const getAllInquiries = async (): Promise<InquiryData[]> => {
  console.log("Fetching all inquiries...");
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return [];
    }

    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inquiries:", error);
      toast.error(`Failed to fetch inquiries: ${error.message}`);
      return [];
    }

    console.log("Successfully fetched inquiries:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in getAllInquiries:", error);
    return [];
  }
};

export const getInquiriesByTourType = async (tourType: string): Promise<InquiryData[]> => {
  console.log("Fetching inquiries by tour type:", tourType);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return [];
    }

    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('tour_type', tourType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inquiries by tour type:", error);
      toast.error(`Failed to fetch inquiries: ${error.message}`);
      return [];
    }

    console.log("Successfully fetched inquiries by tour type:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error in getInquiriesByTourType:", error);
    return [];
  }
};

export const getInquiryById = async (id: string): Promise<InquiryData | null> => {
  console.log("Fetching inquiry by ID:", id);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching inquiry:", error);
      toast.error(`Failed to fetch inquiry: ${error.message}`);
      throw error;
    }

    if (!data) {
      console.log("No inquiry found with ID:", id);
      return null;
    }

    console.log("Successfully fetched inquiry:", data);
    return data;
  } catch (error) {
    console.error("Error in getInquiryById:", error);
    throw error;
  }
};

export const deleteInquiry = async (id: string): Promise<boolean> => {
  console.log("Deleting inquiry:", id);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting inquiry:", error);
      toast.error(`Failed to delete inquiry: ${error.message}`);
      throw error;
    }

    toast.success("Inquiry deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteInquiry:", error);
    throw error;
  }
};

export const assignInquiry = async (inquiryId: string, agentId: string, agentName: string): Promise<InquiryData> => {
  console.log("Assigning inquiry:", inquiryId, "to agent:", agentId);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

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
      console.error("Error assigning inquiry:", error);
      toast.error(`Failed to assign inquiry: ${error.message}`);
      throw error;
    }

    toast.success("Inquiry assigned successfully");
    return data;
  } catch (error) {
    console.error("Error in assignInquiry:", error);
    throw error;
  }
};

export const assignInquiryToAgent = async (inquiryId: string, agentId: string, agentName: string): Promise<InquiryData> => {
  return assignInquiry(inquiryId, agentId, agentName);
};
