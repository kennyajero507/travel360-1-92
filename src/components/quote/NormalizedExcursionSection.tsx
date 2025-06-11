
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EditableDataGrid from './EditableDataGrid';
import { quoteExcursionService } from '../../services/normalizedQuoteService';
import { Column } from './EditableDataGrid';

interface NormalizedExcursionSectionProps {
  quoteId: string;
}

const NormalizedExcursionSection: React.FC<NormalizedExcursionSectionProps> = ({ quoteId }) => {
  const queryClient = useQueryClient();

  const { data: excursions = [], isLoading } = useQuery({
    queryKey: ['quote-excursions', quoteId],
    queryFn: () => quoteExcursionService.getByQuoteId(quoteId),
    enabled: !!quoteId
  });

  const addMutation = useMutation({
    mutationFn: quoteExcursionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-excursions', quoteId] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      quoteExcursionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-excursions', quoteId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: quoteExcursionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-excursions', quoteId] });
    }
  });

  const columns: Column[] = [
    {
      key: 'activity_type',
      label: 'Activity Type',
      type: 'select',
      options: ['Sightseeing', 'Adventure', 'Cultural', 'Religious', 'Nature', 'Entertainment', 'Shopping'],
      required: true,
      width: '120px'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      width: '200px'
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
      key: 'number_of_people',
      label: 'Adults',
      type: 'number',
      width: '80px'
    },
    {
      key: 'number_of_children',
      label: 'Children',
      type: 'number',
      width: '80px'
    }
  ];

  const defaultNewItem = {
    quote_id: quoteId,
    activity_type: 'Sightseeing',
    description: '',
    adult_cost: 0,
    child_cost: 0,
    number_of_people: 1,
    number_of_children: 0
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
      title="🏞️ Excursions & Activities"
      data={excursions}
      columns={columns}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      defaultNewItem={defaultNewItem}
      loading={isLoading}
    />
  );
};

export default NormalizedExcursionSection;
