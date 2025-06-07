
import { supabase } from "../integrations/supabase/client";
import { Invoice, CreateInvoiceData } from "../types/invoice.types";
import { toast } from "sonner";

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `INV-${year}-${timestamp}`;
};

export const invoiceService = {
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
      return [];
    }
  },

  async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to fetch invoice');
      return null;
    }
  },

  async createInvoice(invoiceData: CreateInvoiceData): Promise<Invoice | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', userData.user?.id)
        .single();

      if (!profile?.org_id) {
        toast.error('Organization not found');
        return null;
      }

      const newInvoice = {
        ...invoiceData,
        invoice_number: generateInvoiceNumber(),
        organization_id: profile.org_id,
        created_by: userData.user?.id,
        line_items: JSON.stringify(invoiceData.line_items)
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([newInvoice])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Invoice created successfully');
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
      return null;
    }
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updates.line_items) {
        updateData.line_items = JSON.stringify(updates.line_items);
      }

      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Invoice updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
      return null;
    }
  },

  async deleteInvoice(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Invoice deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
      return false;
    }
  },

  async generateInvoiceFromBooking(bookingId: string): Promise<Invoice | null> {
    try {
      // Fetch booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Create invoice data from booking
      const invoiceData: CreateInvoiceData = {
        booking_id: booking.id,
        client_name: booking.client,
        amount: booking.total_price,
        currency_code: 'USD', // Default, can be made dynamic
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        line_items: [
          {
            id: '1',
            description: `Travel Package - ${booking.hotel_name}`,
            quantity: 1,
            unit_price: booking.total_price,
            total: booking.total_price
          }
        ]
      };

      return await this.createInvoice(invoiceData);
    } catch (error) {
      console.error('Error generating invoice from booking:', error);
      toast.error('Failed to generate invoice');
      return null;
    }
  }
};
