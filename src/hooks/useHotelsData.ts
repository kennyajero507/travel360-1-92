
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types/hotel.types';
import { useState } from 'react';

export const useHotelsData = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const {
    data: hotels = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['hotels'],
    queryFn: hotelService.getAllHotels,
  });

  // Create hotel mutation
  const createHotelMutation = useMutation({
    mutationFn: hotelService.createHotel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    }
  });

  // Update hotel mutation
  const updateHotelMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Hotel> }) => 
      hotelService.updateHotel(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    }
  });

  // Delete hotel mutation
  const deleteHotelMutation = useMutation({
    mutationFn: hotelService.deleteHotel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    }
  });

  // Toggle hotel status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: hotelService.toggleHotelStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    }
  });

  // Filter hotels based on search and filter criteria
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = search === '' || 
      hotel.name.toLowerCase().includes(search.toLowerCase()) ||
      (hotel.destination && hotel.destination.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'all' || !filter) return true;

    switch (filter) {
      case 'negotiated':
        return !!hotel.additional_details?.hasNegotiatedRate;
      case 'non-negotiated':
        return !hotel.additional_details?.hasNegotiatedRate;
      case 'active':
        return hotel.status === 'Active';
      case 'inactive':
        return hotel.status === 'Inactive';
      default:
        return true;
    }
  });

  return {
    hotels,
    isLoading,
    error: error as Error,
    filter,
    setFilter,
    search,
    setSearch,
    filteredHotels,
    createHotel: createHotelMutation.mutateAsync,
    updateHotel: (id: string, updates: Partial<Hotel>) => 
      updateHotelMutation.mutateAsync({ id, updates }),
    deleteHotel: deleteHotelMutation.mutateAsync,
    toggleHotelStatus: toggleStatusMutation.mutateAsync
  };
};
