
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EditableDataGrid from './EditableDataGrid';
import { quoteTransportService } from '../../services/normalizedQuoteService';
import { Column } from './EditableDataGrid';

interface NormalizedTransportSectionProps {
  quoteId: string;
}

const NormalizedTransportSection: React.FC<NormalizedTransportSectionProps> = ({ quoteId }) => {
  const queryClient = useQueryClient();

  const { data: transports = [], isLoading } = useQuery({
    queryKey: ['quote-transport', quoteId],
    queryFn: () => quoteTransportService.getByQuoteId(quoteId),
    enabled: !!quoteId
  });

  const addMutation = useMutation({
    mutationFn: quoteTransportService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-transport', quoteId] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      quoteTransportService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-transport', quoteId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: quoteTransportService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-transport', quoteId] });
    }
  });

  const columns: Column[] = [
    {
      key: 'transport_mode',
      label: 'Transport Mode',
      type: 'select',
      options: ['Flight', 'Train', 'Bus', 'Private Car', 'Taxi'],
      required: true,
      width: '120px'
    },
    {
      key: 'transport_operator',
      label: 'Operator',
      type: 'text',
      width: '120px'
    },
    {
      key: 'ticket_class',
      label: 'Class',
      type: 'select',
      options: ['Economy', 'Business', 'First Class', 'AC', 'Non-AC'],
      width: '100px'
    },
    {
      key: 'ticket_type',
      label: 'Ticket Type',
      type: 'select',
      options: ['One Way', 'Round Trip', 'Multi-City'],
      width: '100px'
    },
    {
      key: 'travel_route',
      label: 'Travel Route',
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
    },
    {
      key: 'note',
      label: 'Note',
      type: 'text',
      width: '150px'
    }
  ];

  const defaultNewItem = {
    quote_id: quoteId,
    transport_mode: 'Flight',
    transport_operator: '',
    ticket_class: 'Economy',
    ticket_type: 'One Way',
    travel_route: '',
    adult_cost: 0,
    child_cost: 0,
    no_adults: 1,
    no_children: 0,
    note: ''
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
      title="🚗 Transport Booking"
      data={transports}
      columns={columns}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      defaultNewItem={defaultNewItem}
      loading={isLoading}
    />
  );
};

export default NormalizedTransportSection;
