
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { generateVoucherPDF } from '../services/pdfVoucherGenerator';

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
      
      // Get voucher data
      const { data: voucher, error: voucherError } = await supabase
        .from('travel_vouchers')
        .select(`
          *,
          bookings!inner (
            *
          )
        `)
        .eq('id', voucherId)
        .single();

      if (voucherError || !voucher) {
        throw new Error('Voucher not found');
      }

      console.log('Voucher data retrieved:', voucher);
      
      // Generate and download PDF
      generateVoucherPDF(voucher, voucher.bookings);
      
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
