
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

interface VoucherEmailData {
  id: string;
  voucher_reference: string;
  booking_id: string;
  bookings?: {
    client: string;
    client_email?: string;
    hotel_name: string;
    travel_start: string;
    travel_end: string;
  };
}

export const sendVoucherEmail = async (voucher: VoucherEmailData) => {
  try {
    // Check if client email exists
    const clientEmail = voucher.bookings?.client_email;
    if (!clientEmail) {
      throw new Error('Client email not found. Please add the client email to the booking before sending the voucher.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      throw new Error('Invalid client email format. Please update the client email in the booking.');
    }

    console.log('Sending voucher email to:', clientEmail);

    // Call the edge function to send email
    const { data, error } = await supabase.functions.invoke('send-voucher-email', {
      body: { 
        voucher,
        booking: voucher.bookings,
        recipient_email: clientEmail
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      
      // Check if it's a RESEND API key issue
      if (error.message?.includes('RESEND_API_KEY') || error.message?.includes('unauthorized')) {
        throw new Error('Email service not configured. Please contact your administrator to set up the RESEND_API_KEY.');
      }
      
      throw new Error(error.message || 'Failed to send voucher email');
    }

    console.log('Email sent successfully:', data);

    // Update voucher as sent
    const { error: updateError } = await supabase
      .from('travel_vouchers')
      .update({ email_sent: true })
      .eq('id', voucher.id);

    if (updateError) {
      console.warn('Voucher sent but failed to update status:', updateError);
      toast.warning('Email sent successfully, but failed to update voucher status');
    }

    return { success: true, data };

  } catch (error) {
    console.error('Error sending voucher email:', error);
    throw error;
  }
};

export const checkEmailConfiguration = async () => {
  try {
    console.log('Checking email configuration...');
    
    // Try to call a simple edge function to check if RESEND is configured
    const { error } = await supabase.functions.invoke('send-voucher-email', {
      body: { test: true }
    });

    if (error?.message?.includes('RESEND_API_KEY')) {
      return {
        configured: false,
        message: 'RESEND_API_KEY not configured. Please contact your administrator.'
      };
    }

    return { configured: true };
  } catch (error) {
    console.error('Error checking email configuration:', error);
    return {
      configured: false,
      message: 'Unable to check email configuration'
    };
  }
};
