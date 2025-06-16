
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

    // Call the enhanced email edge function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { 
        to: clientEmail,
        subject: `Travel Voucher - ${voucher.voucher_reference}`,
        html: generateVoucherEmailHTML(voucher),
        from: 'noreply@travelflow360.com'
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

const generateVoucherEmailHTML = (voucher: VoucherEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Travel Voucher</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .voucher-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Travel Voucher</h1>
          <p>Voucher Reference: ${voucher.voucher_reference}</p>
        </div>
        
        <div class="content">
          <p>Dear ${voucher.bookings?.client || 'Valued Guest'},</p>
          <p>Please find your travel voucher details below:</p>
          
          <div class="voucher-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span><strong>Hotel:</strong></span>
              <span>${voucher.bookings?.hotel_name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span><strong>Check-in:</strong></span>
              <span>${voucher.bookings?.travel_start || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span><strong>Check-out:</strong></span>
              <span>${voucher.bookings?.travel_end || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span><strong>Voucher Reference:</strong></span>
              <span>${voucher.voucher_reference}</span>
            </div>
          </div>
          
          <p>Please present this voucher at check-in. Have a wonderful trip!</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing our services!</p>
          <p>For any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const checkEmailConfiguration = async () => {
  try {
    console.log('Checking email configuration...');
    
    // Try to call the email function to check if RESEND is configured
    const { error } = await supabase.functions.invoke('send-email', {
      body: { 
        to: 'test@example.com',
        subject: 'Test Configuration',
        html: '<p>Test email</p>',
        test: true 
      }
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
