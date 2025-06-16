
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { ErrorHandler } from '../utils/errorHandler';

export interface PaymentRecord {
  id: string;
  booking_id: string;
  invoice_id?: string;
  amount: number;
  currency_code: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date?: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentSummary {
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  payment_count: number;
  currency_code: string;
}

export const paymentService = {
  async createPayment(paymentData: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentRecord | null> {
    try {
      console.log('[PaymentService] Creating payment:', paymentData);
      
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'Creating payment');
        return null;
      }

      toast.success('Payment recorded successfully');
      return data as PaymentRecord;
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'createPayment');
      return null;
    }
  },

  async updatePaymentStatus(paymentId: string, status: PaymentRecord['payment_status'], transactionId?: string): Promise<boolean> {
    try {
      console.log('[PaymentService] Updating payment status:', paymentId, status);
      
      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString()
      };

      if (transactionId) {
        updateData.transaction_id = transactionId;
      }

      if (status === 'completed') {
        updateData.payment_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'Updating payment status');
        return false;
      }

      toast.success(`Payment ${status}`);
      return true;
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'updatePaymentStatus');
      return false;
    }
  },

  async getPaymentsByBooking(bookingId: string): Promise<PaymentRecord[]> {
    try {
      console.log('[PaymentService] Fetching payments for booking:', bookingId);
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'Fetching payments');
        return [];
      }

      return (data || []).map(payment => ({
        ...payment,
        payment_status: payment.payment_status as PaymentRecord['payment_status']
      }));
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'getPaymentsByBooking');
      return [];
    }
  },

  async getPaymentSummary(bookingId: string): Promise<PaymentSummary | null> {
    try {
      console.log('[PaymentService] Getting payment summary for booking:', bookingId);
      
      // Get booking total
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        ErrorHandler.handleSupabaseError(bookingError, 'Fetching booking for summary');
        return null;
      }

      // Get all payments for this booking
      const payments = await this.getPaymentsByBooking(bookingId);
      
      const paidAmount = payments
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalAmount = Number(booking.total_price);

      return {
        total_amount: totalAmount,
        paid_amount: paidAmount,
        outstanding_amount: totalAmount - paidAmount,
        payment_count: payments.length,
        currency_code: payments[0]?.currency_code || 'USD'
      };
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'getPaymentSummary');
      return null;
    }
  },

  async getAllPayments(): Promise<PaymentRecord[]> {
    try {
      console.log('[PaymentService] Fetching all payments');
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'Fetching all payments');
        return [];
      }

      return (data || []).map(payment => ({
        ...payment,
        payment_status: payment.payment_status as PaymentRecord['payment_status']
      }));
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'getAllPayments');
      return [];
    }
  }
};
