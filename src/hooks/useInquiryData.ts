import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as inquiryService from '@/services/inquiry';
import { InquiryInsertData, InquiryData } from '@/types/inquiry.types';

export const useInquiries = () => {
  return useQuery({
    queryKey: ['inquiries'],
    queryFn: () => {
      console.log('[useInquiries] Fetching all inquiries');
      return inquiryService.getAllInquiries();
    },
  });
};

export const useCreateInquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inquiryData: InquiryInsertData) => {
      console.log('[useCreateInquiry] Creating inquiry:', inquiryData);
      return inquiryService.createInquiry(inquiryData);
    },
    onSuccess: () => {
      console.log('[useCreateInquiry] Inquiry created successfully');
      toast.success('Inquiry created successfully');
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
    onError: (error: Error) => {
      console.error('[useCreateInquiry] Error creating inquiry:', error);
      toast.error(`Failed to create inquiry: ${error.message}`);
    },
  });
};

export const useUpdateInquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inquiryId, updates }: { inquiryId: string, updates: Partial<InquiryData> }) => {
      console.log('[useUpdateInquiry] Updating inquiry:', inquiryId, updates);
      return inquiryService.updateInquiry(inquiryId, updates);
    },
    onSuccess: (data) => {
      console.log('[useUpdateInquiry] Inquiry updated successfully:', data);
      toast.success('Inquiry updated successfully');
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiry', data.id] });
    },
    onError: (error: Error) => {
      console.error('[useUpdateInquiry] Error updating inquiry:', error);
      toast.error(`Failed to update inquiry: ${error.message}`);
    },
  });
};

export const useAssignInquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inquiryId, agentId, agentName }: { inquiryId: string, agentId: string, agentName: string }) => {
      return inquiryService.assignInquiryToAgent(inquiryId, agentId, agentName);
    },
    onSuccess: (data) => {
      toast.success(`Inquiry assigned to ${data.assigned_agent_name} successfully`);
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign inquiry: ${error.message}`);
    }
  });
};
