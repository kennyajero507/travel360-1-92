
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

export const createInquiry = async (inquiryData: any) => {
  console.log("Creating inquiry:", inquiryData);
  
  try {
    // Generate a unique ID for the inquiry
    const inquiryId = crypto.randomUUID();
    
    // Prepare the data for insertion with the ID
    const dataToInsert = {
      id: inquiryId, // Add the required ID field
      enquiry_number: `ENQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      tour_type: inquiryData.tourType || 'domestic',
      lead_source: inquiryData.leadSource || null,
      tour_consultant: inquiryData.tourConsultant || null,
      client_name: inquiryData.clientName,
      client_email: inquiryData.clientEmail || null,
      client_mobile: inquiryData.clientMobile,
      destination: inquiryData.destination,
      package_name: inquiryData.packageName || null,
      custom_destination: inquiryData.customDestination || null,
      custom_package: inquiryData.customPackage || null,
      check_in_date: inquiryData.checkInDate,
      check_out_date: inquiryData.checkOutDate,
      adults: inquiryData.adults || 1,
      children: inquiryData.children || 0,
      infants: inquiryData.infants || 0,
      num_rooms: inquiryData.numRooms || null,
      description: inquiryData.description || null,
      priority: inquiryData.priority || 'Normal',
      assigned_to: inquiryData.assignedTo || null,
      assigned_agent_name: inquiryData.assignedAgentName || null,
      created_by: inquiryData.createdBy || null,
      status: inquiryData.status || 'New'
    };
    
    const { data, error } = await supabase
      .from('inquiries')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error creating inquiry:", error);
      toast.error("Failed to create inquiry");
      throw error;
    }

    toast.success("Inquiry created successfully");
    return data;
  } catch (error) {
    console.error("Error in createInquiry:", error);
    throw error;
  }
};

export const updateInquiry = async (id: string, inquiryData: any) => {
  console.log("Updating inquiry:", id, inquiryData);
  
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .update({
        tour_type: inquiryData.tourType,
        lead_source: inquiryData.leadSource,
        tour_consultant: inquiryData.tourConsultant,
        client_name: inquiryData.clientName,
        client_email: inquiryData.clientEmail,
        client_mobile: inquiryData.clientMobile,
        destination: inquiryData.destination,
        package_name: inquiryData.packageName,
        custom_destination: inquiryData.customDestination,
        custom_package: inquiryData.customPackage,
        check_in_date: inquiryData.checkInDate,
        check_out_date: inquiryData.checkOutDate,
        adults: inquiryData.adults,
        children: inquiryData.children,
        infants: inquiryData.infants,
        num_rooms: inquiryData.numRooms,
        description: inquiryData.description,
        priority: inquiryData.priority,
        assigned_to: inquiryData.assignedTo,
        assigned_agent_name: inquiryData.assignedAgentName,
        status: inquiryData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inquiry:", error);
      toast.error("Failed to update inquiry");
      throw error;
    }

    toast.success("Inquiry updated successfully");
    return data;
  } catch (error) {
    console.error("Error in updateInquiry:", error);
    throw error;
  }
};

export const getAllInquiries = async () => {
  console.log("Fetching all inquiries...");
  
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to fetch inquiries");
      throw error;
    }

    console.log("Fetched inquiries:", data);
    return data || [];
  } catch (error) {
    console.error("Error in getAllInquiries:", error);
    return [];
  }
};

export const getInquiryById = async (id: string) => {
  console.log("Fetching inquiry by ID:", id);
  
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching inquiry:", error);
      toast.error("Failed to fetch inquiry");
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in getInquiryById:", error);
    throw error;
  }
};

export const deleteInquiry = async (id: string) => {
  console.log("Deleting inquiry:", id);
  
  try {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting inquiry:", error);
      toast.error("Failed to delete inquiry");
      throw error;
    }

    toast.success("Inquiry deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteInquiry:", error);
    throw error;
  }
};

export const assignInquiry = async (inquiryId: string, agentId: string, agentName: string) => {
  console.log("Assigning inquiry:", inquiryId, "to agent:", agentId);
  
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
      console.error("Error assigning inquiry:", error);
      toast.error("Failed to assign inquiry");
      throw error;
    }

    toast.success("Inquiry assigned successfully");
    return data;
  } catch (error) {
    console.error("Error in assignInquiry:", error);
    throw error;
  }
};
