
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService, PaymentRecord, PaymentSummary } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSync } from './useRealtimeSync';
import { toast } from 'sonner';

export const usePaymentData = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  // Real-time sync for payments
  useRealtimeSync({
    table: 'payments',
    orgId,
    queryKeysInvalidate: ['payments'],
    queryClient,
  });

  const {
    data: payments = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['payments'],
    queryFn: paymentService.getAllPayments,
  });

  const createPaymentMutation = useMutation({
    mutationFn: paymentService.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ paymentId, status, transactionId }: { 
      paymentId: string; 
      status: PaymentRecord['payment_status']; 
      transactionId?: string;
    }) => paymentService.updatePaymentStatus(paymentId, status, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
    }
  });

  return {
    payments,
    isLoading,
    error,
    createPayment: createPaymentMutation.mutateAsync,
    updatePaymentStatus: (paymentId: string, status: PaymentRecord['payment_status'], transactionId?: string) =>
      updatePaymentStatusMutation.mutateAsync({ paymentId, status, transactionId }),
    isCreating: createPaymentMutation.isPending,
    isUpdating: updatePaymentStatusMutation.isPending
  };
};

export const useBookingPayments = (bookingId: string) => {
  const queryClient = useQueryClient();

  const {
    data: payments = [],
    isLoading: isLoadingPayments
  } = useQuery({
    queryKey: ['booking-payments', bookingId],
    queryFn: () => paymentService.getPaymentsByBooking(bookingId),
    enabled: !!bookingId
  });

  const {
    data: paymentSummary,
    isLoading: isLoadingSummary
  } = useQuery({
    queryKey: ['payment-summary', bookingId],
    queryFn: () => paymentService.getPaymentSummary(bookingId),
    enabled: !!bookingId
  });

  return {
    payments,
    paymentSummary,
    isLoading: isLoadingPayments || isLoadingSummary,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-payments', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary', bookingId] });
    }
  };
};
