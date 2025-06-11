
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EditableDataGrid from './EditableDataGrid';
import { quoteAccommodationService } from '../../services/normalizedQuoteService';
import { Column } from './EditableDataGrid';

interface NormalizedAccommodationSectionProps {
  quoteId: string;
}

const NormalizedAccommodationSection: React.FC<NormalizedAccommodationSectionProps> = ({ quoteId }) => {
  const queryClient = useQueryClient();

  const { data: accommodations = [], isLoading } = useQuery({
    queryKey: ['quote-accommodations', quoteId],
    queryFn: () => quoteAccommodationService.getByQuoteId(quoteId),
    enabled: !!quoteId
  });

  const addMutation = useMutation({
    mutationFn: quoteAccommodationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-accommodations', quoteId] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      quoteAccommodationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-accommodations', quoteId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: quoteAccommodationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-accommodations', quoteId] });
    }
  });

  const columns: Column[] = [
    {
      key: 'room_arrangement',
      label: 'Room Arrangement',
      type: 'text',
      required: true,
      width: '150px'
    },
    {
      key: 'room_type',
      label: 'Room Type',
      type: 'select',
      options: ['Standard Room', 'Deluxe Room', 'Suite', 'Family Room', 'Executive Room'],
      required: true,
      width: '140px'
    },
    {
      key: 'no_rooms',
      label: 'Rooms',
      type: 'number',
      width: '80px'
    },
    {
      key: 'no_adults',
      label: 'Adults',
      type: 'number',
      width: '80px'
    },
    {
      key: 'no_cwb',
      label: 'Child w/Bed',
      type: 'number',
      width: '90px'
    },
    {
      key: 'no_cnb',
      label: 'Child no Bed',
      type: 'number',
      width: '100px'
    },
    {
      key: 'no_infants',
      label: 'Infants',
      type: 'number',
      width: '80px'
    },
    {
      key: 'adult_cost',
      label: 'Adult Cost',
      type: 'number',
      width: '100px'
    },
    {
      key: 'cwb_cost',
      label: 'CWB Cost',
      type: 'number',
      width: '100px'
    },
    {
      key: 'cnb_cost',
      label: 'CNB Cost',
      type: 'number',
      width: '100px'
    },
    {
      key: 'infant_cost',
      label: 'Infant Cost',
      type: 'number',
      width: '100px'
    }
  ];

  const defaultNewItem = {
    quote_id: quoteId,
    room_arrangement: '',
    room_type: 'Standard Room',
    no_rooms: 1,
    no_adults: 2,
    no_cwb: 0,
    no_cnb: 0,
    no_infants: 0,
    adult_cost: 0,
    cwb_cost: 0,
    cnb_cost: 0,
    infant_cost: 0
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
      title="🏨 Accommodation Details"
      data={accommodations}
      columns={columns}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      defaultNewItem={defaultNewItem}
      loading={isLoading}
    />
  );
};

export default NormalizedAccommodationSection;
