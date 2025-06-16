
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  
  static async sendEmail(emailData: EmailTemplate): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      console.log('Sending email to:', emailData.to);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });
      
      if (error) {
        console.error('Email service error:', error);
        
        // Check for specific configuration errors
        if (error.message?.includes('RESEND_API_KEY')) {
          return {
            success: false,
            error: 'Email service not configured. Please contact your administrator to set up the RESEND_API_KEY.'
          };
        }
        
        return {
          success: false,
          error: error.message || 'Failed to send email'
        };
      }
      
      console.log('Email sent successfully:', data);
      return {
        success: true,
        messageId: data?.id
      };
      
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  }
  
  static async sendVoucherEmail(voucherId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('Sending voucher email for:', voucherId);
      
      // Get voucher with booking details
      const { data: voucher, error: voucherError } = await supabase
        .from('travel_vouchers')
        .select(`
          *,
          bookings!inner(
            id,
            client,
            client_email,
            hotel_name,
            travel_start,
            travel_end,
            booking_reference
          )
        `)
        .eq('id', voucherId)
        .single();
      
      if (voucherError || !voucher) {
        return {
          success: false,
          error: 'Voucher not found'
        };
      }
      
      const booking = voucher.bookings;
      if (!booking.client_email) {
        return {
          success: false,
          error: 'Client email not found. Please add the client email to the booking.'
        };
      }
      
      const emailData: EmailTemplate = {
        to: booking.client_email,
        subject: `Travel Voucher - ${voucher.voucher_reference}`,
        html: this.generateVoucherEmailHTML(voucher, booking),
        from: 'noreply@travelflow360.com'
      };
      
      const result = await this.sendEmail(emailData);
      
      if (result.success) {
        // Mark voucher as sent
        await supabase
          .from('travel_vouchers')
          .update({ email_sent: true })
          .eq('id', voucherId);
      }
      
      return result;
      
    } catch (error) {
      console.error('Error sending voucher email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send voucher email'
      };
    }
  }
  
  private static generateVoucherEmailHTML(voucher: any, booking: any): string {
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
          .header { background: #0d9488; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9fafb; }
          .voucher-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">TravelFlow360</div>
            <h1>Travel Voucher</h1>
            <p>Voucher Reference: ${voucher.voucher_reference}</p>
          </div>
          
          <div class="content">
            <p>Dear ${booking.client},</p>
            <p>Please find your travel voucher details below:</p>
            
            <div class="voucher-details">
              <h3>Booking Details</h3>
              <div class="detail-row">
                <span><strong>Booking Reference:</strong></span>
                <span>${booking.booking_reference}</span>
              </div>
              <div class="detail-row">
                <span><strong>Hotel:</strong></span>
                <span>${booking.hotel_name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Check-in:</strong></span>
                <span>${new Date(booking.travel_start).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span><strong>Check-out:</strong></span>
                <span>${new Date(booking.travel_end).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span><strong>Voucher Reference:</strong></span>
                <span>${voucher.voucher_reference}</span>
              </div>
              <div class="detail-row">
                <span><strong>Issue Date:</strong></span>
                <span>${new Date(voucher.issued_date).toLocaleDateString()}</span>
              </div>
            </div>
            
            <p>Please present this voucher at check-in. Have a wonderful trip!</p>
            
            ${voucher.notes ? `<p><strong>Additional Notes:</strong><br>${voucher.notes}</p>` : ''}
          </div>
          
          <div class="footer">
            <p>Thank you for choosing TravelFlow360!</p>
            <p>For any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  static async checkEmailConfiguration(): Promise<{
    configured: boolean;
    message?: string;
  }> {
    try {
      console.log('Checking email configuration...');
      
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
  }
}

export default EmailService;
