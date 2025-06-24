
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { generateVoucherPDF } from '../services/pdfVoucherGenerator';
import { Booking, TravelVoucher } from '../types/booking.types';
import { ensureBookingStatus } from '../utils/typeHelpers';

export const useVoucherActions = () => {
  const queryClient = useQueryClient();

  const sendEmailMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      const vouchers = queryClient.getQueryData(['vouchers']) as any[];
      const voucher = vouchers?.find(v => v.id === voucherId);
      if (!voucher) throw new Error('Voucher not found');

      const { error } = await supabase.functions.invoke('send-voucher-email', {
        body: { voucher, booking: voucher.bookings }
      });

      if (error) throw error;

      // Update the voucher as sent
      const { error: updateError } = await supabase
        .from('travel_vouchers')
        .update({ email_sent: true })
        .eq('id', voucherId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Voucher email sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
    onError: (error) => {
      console.error('Error sending voucher email:', error);
      toast.error('Failed to send voucher email. Please try again.');
    }
  });

  const downloadMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      console.log('Starting voucher download for:', voucherId);
      
      // Get voucher data with proper typing
      const { data: voucherData, error: voucherError } = await supabase
        .from('travel_vouchers')
        .select(`
          *,
          bookings!inner (
            *
          )
        `)
        .eq('id', voucherId)
        .single();

      if (voucherError || !voucherData) {
        throw new Error('Voucher not found');
      }

      console.log('Voucher data retrieved:', voucherData);
      
      // Create properly typed voucher object
      const voucher: TravelVoucher = {
        id: voucherData.id,
        booking_id: voucherData.booking_id,
        voucher_reference: voucherData.voucher_reference,
        issued_date: voucherData.issued_date,
        issued_by: voucherData.issued_by,
        notes: voucherData.notes,
        email_sent: voucherData.email_sent,
        voucher_pdf_url: voucherData.voucher_pdf_url,
        created_at: voucherData.created_at,
        updated_at: voucherData.updated_at
      };

      // Create properly typed booking object
      const bookingData = voucherData.bookings;
      const booking: Booking = {
        id: bookingData.id,
        booking_reference: bookingData.booking_reference,
        client: bookingData.client,
        client_email: bookingData.client_email,
        hotel_name: bookingData.hotel_name,
        hotel_id: bookingData.hotel_id,
        agent_id: bookingData.agent_id,
        travel_start: bookingData.travel_start,
        travel_end: bookingData.travel_end,
        room_arrangement: Array.isArray(bookingData.room_arrangement) 
          ? bookingData.room_arrangement 
          : JSON.parse(bookingData.room_arrangement as string || '[]'),
        transport: Array.isArray(bookingData.transport)
          ? bookingData.transport
          : JSON.parse(bookingData.transport as string || '[]'),
        activities: Array.isArray(bookingData.activities)
          ? bookingData.activities
          : JSON.parse(bookingData.activities as string || '[]'),
        transfers: Array.isArray(bookingData.transfers)
          ? bookingData.transfers
          : JSON.parse(bookingData.transfers as string || '[]'),
        status: ensureBookingStatus(bookingData.status),
        total_price: bookingData.total_price,
        quote_id: bookingData.quote_id,
        notes: bookingData.notes,
        org_id: bookingData.org_id,
        created_at: bookingData.created_at,
        updated_at: bookingData.updated_at
      };
      
      // Generate and download PDF
      generateVoucherPDF(voucher, booking);
      
      return voucher;
    },
    onSuccess: () => {
      toast.success('Voucher PDF downloaded successfully!');
    },
    onError: (error) => {
      console.error('Error downloading voucher:', error);
      toast.error('Failed to download voucher PDF. Please try again.');
    }
  });

  const handleDownload = async (voucherId: string) => {
    downloadMutation.mutate(voucherId);
  };

  return {
    sendEmail: sendEmailMutation.mutate,
    handleDownload,
    isLoading: sendEmailMutation.isPending || downloadMutation.isPending
  };
};
