
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { clientService } from '../services/clientService';

export const useClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();

  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => {
      if (!clientId) return null;
      return clientService.getClientById(clientId);
    },
    enabled: !!clientId,
  });

  return { client, isLoading, isError, clientId };
};
