
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Booking, BookingStatus } from '../types/booking.types';

export class EnhancedBookingWorkflow {
  
  static async validateBookingData(bookingData: Partial<Booking>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Required field validation
    if (!bookingData.client) errors.push('Client name is required');
    if (!bookingData.hotel_name) errors.push('Hotel name is required');
    if (!bookingData.travel_start) errors.push('Travel start date is required');
    if (!bookingData.travel_end) errors.push('Travel end date is required');
    if (!bookingData.booking_reference) errors.push('Booking reference is required');
    
    // Date validation
    if (bookingData.travel_start && bookingData.travel_end) {
      const startDate = new Date(bookingData.travel_start);
      const endDate = new Date(bookingData.travel_end);
      
      if (startDate >= endDate) {
        errors.push('Travel end date must be after start date');
      }
      
      if (startDate < new Date()) {
        errors.push('Travel start date cannot be in the past');
      }
    }
    
    // Price validation
    if (bookingData.total_price && bookingData.total_price <= 0) {
      errors.push('Total price must be greater than 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static async createBookingWithValidation(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<{
    success: boolean;
    booking?: Booking;
    error?: string;
  }> {
    try {
      console.log('Starting booking creation with data:', bookingData);
      
      // Validate booking data
      const validation = await this.validateBookingData(bookingData);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }
      
      // Ensure org_id is set
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.org_id) {
        return {
          success: false,
          error: 'User organization not found'
        };
      }
      
      // Add org_id to booking data
      const completeBookingData = {
        ...bookingData,
        org_id: profile.org_id,
        status: 'pending' as BookingStatus
      };
      
      console.log('Creating booking with complete data:', completeBookingData);
      
      // Create the booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([completeBookingData])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating booking:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`
        };
      }
      
      console.log('Booking created successfully:', booking);
      
      // Create audit log
      await this.logBookingAction(booking.id, 'CREATED', user.id, {
        action: 'booking_created',
        booking_reference: booking.booking_reference,
        client: booking.client
      });
      
      return {
        success: true,
        booking: booking as Booking
      };
      
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  static async updateBookingStatus(
    bookingId: string, 
    newStatus: BookingStatus, 
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Updating booking ${bookingId} status to ${newStatus}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.notes = notes;
      }
      
      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);
      
      if (error) {
        console.error('Error updating booking status:', error);
        return { success: false, error: error.message };
      }
      
      // Log the status change
      await this.logBookingAction(bookingId, 'STATUS_UPDATED', user.id, {
        old_status: 'unknown',
        new_status: newStatus,
        notes
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
  
  private static async logBookingAction(
    bookingId: string, 
    action: string, 
    userId: string, 
    details: any
  ): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert([{
          table_name: 'bookings',
          operation: action,
          record_id: bookingId,
          user_id: userId,
          new_values: details
        }]);
    } catch (error) {
      console.warn('Failed to log booking action:', error);
      // Don't fail the main operation if logging fails
    }
  }
  
  static async checkBookingEligibility(quoteId: string): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    try {
      const { data: quote, error } = await supabase
        .from('quotes')
        .select('status, approved_hotel_id, client, start_date, end_date')
        .eq('id', quoteId)
        .single();
      
      if (error) {
        return { eligible: false, reason: 'Quote not found' };
      }
      
      if (!quote.approved_hotel_id) {
        return { eligible: false, reason: 'Quote must have an approved hotel' };
      }
      
      if (quote.status !== 'approved') {
        return { eligible: false, reason: 'Quote must be approved by client' };
      }
      
      // Check if travel dates are in the future
      const startDate = new Date(quote.start_date);
      if (startDate < new Date()) {
        return { eligible: false, reason: 'Travel dates cannot be in the past' };
      }
      
      return { eligible: true };
      
    } catch (error) {
      console.error('Error checking booking eligibility:', error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }
}

export default EnhancedBookingWorkflow;
