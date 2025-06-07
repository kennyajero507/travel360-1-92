
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService';
import { Invoice, CreateInvoiceData } from '../types/invoice.types';
import { toast } from 'sonner';

export const useInvoiceData = () => {
  const queryClient = useQueryClient();

  const {
    data: invoices = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoiceService.getAllInvoices,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: invoiceService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Invoice> }) =>
      invoiceService.updateInvoice(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: invoiceService.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const generateFromBookingMutation = useMutation({
    mutationFn: invoiceService.generateInvoiceFromBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  return {
    invoices,
    isLoading,
    error,
    createInvoice: createInvoiceMutation.mutateAsync,
    updateInvoice: (id: string, updates: Partial<Invoice>) =>
      updateInvoiceMutation.mutateAsync({ id, updates }),
    deleteInvoice: deleteInvoiceMutation.mutateAsync,
    generateInvoiceFromBooking: generateFromBookingMutation.mutateAsync,
    isCreating: createInvoiceMutation.isPending,
    isUpdating: updateInvoiceMutation.isPending,
    isDeleting: deleteInvoiceMutation.isPending
  };
};
