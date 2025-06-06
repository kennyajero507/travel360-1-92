
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { hotelService, Hotel } from "../services/hotelService";

export const useHotelsData = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: hotels = [], isLoading, error } = useQuery({
    queryKey: ['hotels'],
    queryFn: hotelService.getAllHotels,
  });

  // Filtered hotels logic
  const filteredHotels = hotels.filter(hotel => {
    const matchesFilter = filter === "all" || 
      (filter === "negotiated" && hotel.additional_details?.hasNegotiatedRate) ||
      (filter === "non-negotiated" && !hotel.additional_details?.hasNegotiatedRate) ||
      (filter === "active" && hotel.status === "Active") ||
      (filter === "inactive" && hotel.status === "Inactive");
    
    const matchesSearch = hotel.name?.toLowerCase().includes(search.toLowerCase()) ||
                          hotel.destination?.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Toggle hotel active status
  const toggleHotelStatus = async (hotelId: string) => {
    try {
      await hotelService.toggleHotelStatus(hotelId);
      // Invalidate and refetch hotels
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    } catch (error) {
      console.error("Error updating hotel status:", error);
    }
  };

  return {
    hotels,
    isLoading,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    filteredHotels,
    toggleHotelStatus
  };
};
