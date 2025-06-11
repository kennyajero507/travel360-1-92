
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EditableDataGrid from './EditableDataGrid';
import { quoteTransferService } from '../../services/normalizedQuoteService';
import { Column } from './EditableDataGrid';

interface NormalizedTransferSectionProps {
  quoteId: string;
}

const NormalizedTransferSection: React.FC<NormalizedTransferSectionProps> = ({ quoteId }) => {
  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['quote-transfers', quoteId],
    queryFn: () => quoteTransferService.getByQuoteId(quoteId),
    enabled: !!quoteId
  });

  const addMutation = useMutation({
    mutationFn: quoteTransferService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-transfers', quoteId] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      quoteTransferService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-transfers', quoteId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: quoteTransferService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-transfers', quoteId] });
    }
  });

  const columns: Column[] = [
    {
      key: 'transfer_type',
      label: 'Transfer Type',
      type: 'select',
      options: ['Airport Pickup', 'Airport Drop', 'Hotel Transfer', 'Sightseeing', 'Intercity'],
      required: true,
      width: '120px'
    },
    {
      key: 'transfer_operator',
      label: 'Operator',
      type: 'text',
      width: '120px'
    },
    {
      key: 'ticket_type',
      label: 'Vehicle Type',
      type: 'select',
      options: ['Sedan', 'SUV', 'Mini Bus', 'Coach', 'Luxury Car'],
      width: '100px'
    },
    {
      key: 'travel_route',
      label: 'Route',
      type: 'text',
      required: true,
      width: '150px'
    },
    {
      key: 'adult_cost',
      label: 'Adult Cost',
      type: 'number',
      width: '100px'
    },
    {
      key: 'child_cost',
      label: 'Child Cost',
      type: 'number',
      width: '100px'
    },
    {
      key: 'no_adults',
      label: 'Adults',
      type: 'number',
      width: '80px'
    },
    {
      key: 'no_children',
      label: 'Children',
      type: 'number',
      width: '80px'
    }
  ];

  const defaultNewItem = {
    quote_id: quoteId,
    transfer_type: 'Airport Pickup',
    transfer_operator: '',
    ticket_type: 'Sedan',
    travel_route: '',
    adult_cost: 0,
    child_cost: 0,
    no_adults: 1,
    no_children: 0
  };

  const handleAdd = async (item: any) => {
    await addMutation.mutateAsync(item);
  };

  const handleUpdate = async (id: string, item: any) => {
    await updateMutation.mutateAsync({ id, data: item });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <EditableDataGrid
      title="🚐 Transfer Services"
      data={transfers}
      columns={columns}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      defaultNewItem={defaultNewItem}
      loading={isLoading}
    />
  );
};

export default NormalizedTransferSection;
