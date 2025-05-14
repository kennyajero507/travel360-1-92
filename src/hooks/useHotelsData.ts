
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Hotel } from "../types/hotel.types";

// Mock hotel data for initial state when no hotels exist in localStorage
import { mockHotels } from "../utils/mockHotels";

export const useHotelsData = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Load hotels from localStorage
  useEffect(() => {
    try {
      const savedHotels = JSON.parse(localStorage.getItem('hotels') || '[]');
      if (savedHotels && savedHotels.length > 0) {
        setHotels(savedHotels);
      } else {
        // If no hotels in localStorage, use mock data
        setHotels(mockHotels);
      }
    } catch (error) {
      console.error("Error loading hotels:", error);
      setHotels(mockHotels);
    }
  }, []);

  // Filtered hotels logic
  const filteredHotels = hotels.filter(hotel => {
    const matchesFilter = filter === "all" || 
      (filter === "negotiated" && hotel.additionalDetails?.hasNegotiatedRate) ||
      (filter === "non-negotiated" && !hotel.additionalDetails?.hasNegotiatedRate) ||
      (filter === "active" && hotel.status === "Active") ||
      (filter === "inactive" && hotel.status === "Inactive");
    
    const matchesSearch = hotel.name?.toLowerCase().includes(search.toLowerCase()) ||
                          hotel.destination?.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Toggle hotel active status
  const toggleHotelStatus = (hotelId: string) => {
    try {
      const updatedHotels = hotels.map(hotel => {
        if (hotel.id === hotelId) {
          return {
            ...hotel,
            status: hotel.status === "Active" ? "Inactive" : "Active"
          };
        }
        return hotel;
      });
      
      setHotels(updatedHotels);
      localStorage.setItem('hotels', JSON.stringify(updatedHotels));
      
      // Find the hotel to use in the toast message
      const hotel = hotels.find(h => h.id === hotelId);
      if (hotel) {
        toast.success(`Hotel ${hotel.status === "Active" ? "deactivated" : "activated"} successfully`);
      }
    } catch (error) {
      console.error("Error updating hotel status:", error);
      toast.error("Failed to update hotel status");
    }
  };

  return {
    hotels,
    filter,
    setFilter,
    search,
    setSearch,
    filteredHotels,
    toggleHotelStatus
  };
};
