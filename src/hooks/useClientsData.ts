
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/clientService';
import { NewClient } from '../types/client.types';
import { useState, useMemo } from 'react';
import { useErrorHandling } from './useErrorHandling';
import { toast } from 'sonner';

export const useClientsData = () => {
  const queryClient = useQueryClient();
  const { handleAsyncOperation } = useErrorHandling();
  const [search, setSearch] = useState('');

  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: () => handleAsyncOperation(clientService.getAllClients, 'fetching clients'),
  });

  const createClientMutation = useMutation({
    mutationFn: (newClient: NewClient) => handleAsyncOperation(() => clientService.createClient(newClient), 'creating client'),
    onSuccess: (newClient) => {
      if (newClient) {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        toast.success('Client created successfully');
      }
    },
  });

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter(client => {
      const searchLower = search.toLowerCase();
      return (
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        (client.location && client.location.toLowerCase().includes(searchLower)) ||
        (client.id && client.id.toLowerCase().includes(searchLower))
      );
    })
  }, [clients, search]);

  return {
    clients: filteredClients,
    isLoading,
    isError,
    search,
    setSearch,
    createClient: createClientMutation.mutateAsync,
  };
};
