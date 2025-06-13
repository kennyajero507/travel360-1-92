
import { supabase } from "../integrations/supabase/client";

export interface EmailTemplate {
  type: string;
  subject: string;
  html: string;
}

class EmailService {
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    template?: string,
    templateData?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html,
          template,
          templateData,
        },
      });

      if (error) {
        console.error('Error sending email:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in email service:', error);
      return false;
    }
  }

  async sendQuoteEmail(quoteData: any, clientEmail: string): Promise<boolean> {
    const subject = `Quote ${quoteData.short_id || quoteData.id} - ${quoteData.destination}`;
    const html = this.generateQuoteEmailHTML(quoteData);
    
    return this.sendEmail(clientEmail, subject, html, 'quote', quoteData);
  }

  async sendBookingConfirmation(bookingData: any, clientEmail: string): Promise<boolean> {
    const subject = `Booking Confirmation - ${bookingData.booking_reference}`;
    const html = this.generateBookingEmailHTML(bookingData);
    
    return this.sendEmail(clientEmail, subject, html, 'booking_confirmation', bookingData);
  }

  async sendVoucherEmail(voucherData: any, clientEmail: string): Promise<boolean> {
    const subject = `Travel Voucher - ${voucherData.voucher_reference}`;
    const html = this.generateVoucherEmailHTML(voucherData);
    
    return this.sendEmail(clientEmail, subject, html, 'voucher', voucherData);
  }

  private generateQuoteEmailHTML(quoteData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Travel Quote</h2>
        <p>Dear ${quoteData.client},</p>
        <p>Thank you for your inquiry. Please find your travel quote details below:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Quote Details</h3>
          <p><strong>Quote ID:</strong> ${quoteData.short_id || quoteData.id}</p>
          <p><strong>Destination:</strong> ${quoteData.destination}</p>
          <p><strong>Travel Dates:</strong> ${quoteData.start_date} to ${quoteData.end_date}</p>
          <p><strong>Duration:</strong> ${quoteData.duration_nights} nights, ${quoteData.duration_days} days</p>
          <p><strong>Guests:</strong> ${quoteData.adults} Adults, ${quoteData.children_with_bed + quoteData.children_no_bed} Children</p>
        </div>
        
        <p>For more details or to confirm your booking, please contact us.</p>
        <p>Best regards,<br>TravelFlow360 Team</p>
      </div>
    `;
  }

  private generateBookingEmailHTML(bookingData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmation</h2>
        <p>Dear ${bookingData.client},</p>
        <p>Your booking has been confirmed! Here are your booking details:</p>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details</h3>
          <p><strong>Booking Reference:</strong> ${bookingData.booking_reference}</p>
          <p><strong>Hotel:</strong> ${bookingData.hotel_name}</p>
          <p><strong>Travel Dates:</strong> ${bookingData.travel_start} to ${bookingData.travel_end}</p>
          <p><strong>Status:</strong> ${bookingData.status}</p>
          <p><strong>Total Amount:</strong> $${bookingData.total_price}</p>
        </div>
        
        <p>Your travel voucher will be sent separately.</p>
        <p>Best regards,<br>TravelFlow360 Team</p>
      </div>
    `;
  }

  private generateVoucherEmailHTML(voucherData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Travel Voucher</h2>
        <p>Dear valued guest,</p>
        <p>Please find your travel voucher attached.</p>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Voucher Details</h3>
          <p><strong>Voucher Reference:</strong> ${voucherData.voucher_reference}</p>
          <p><strong>Issue Date:</strong> ${voucherData.issued_date}</p>
        </div>
        
        <p>Please present this voucher during your travel.</p>
        <p>Have a wonderful trip!<br>TravelFlow360 Team</p>
      </div>
    `;
  }
}

export const emailService = new EmailService();
