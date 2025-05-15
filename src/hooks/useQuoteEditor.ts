
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuoteData, RoomArrangement } from "../types/quote.types";
import { getQuoteById, saveQuote } from "../services/quoteService";
import { useQuoteCalculations } from "./useQuoteCalculations";

export const useQuoteEditor = (quoteId: string | undefined, role: string) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  
  // Load quote data
  useEffect(() => {
    if (!quoteId) return;
    
    const loadQuote = async () => {
      try {
        setLoading(true);
        const quoteData = await getQuoteById(quoteId);
        
        if (quoteData) {
          setQuote(quoteData);
          // If there's a saved hotelId in the quote, select it
          if (quoteData.hotelId) {
            setSelectedHotelId(quoteData.hotelId);
          }
        } else {
          toast.error("Quote not found");
          navigate("/quotes");
        }
      } catch (error) {
        console.error("Error loading quote:", error);
        toast.error("Failed to load quote data");
      } finally {
        setLoading(false);
      }
    };
    
    loadQuote();
  }, [quoteId, navigate]);
  
  // Check permissions
  useEffect(() => {
    // Only allow agent, tour_operator, org_owner, or system_admin roles to edit quotes
    if (!['agent', 'tour_operator', 'org_owner', 'system_admin'].includes(role)) {
      toast.error("You don't have permission to edit quotes");
      navigate("/");
    }
  }, [role, navigate]);

  // Use the quote calculations hook if quote data is available
  const calculations = quote ? useQuoteCalculations(quote) : null;
  
  // Handle hotel selection
  const handleHotelSelection = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    if (quote) {
      setQuote({
        ...quote,
        hotelId: hotelId
      });
    }
  };
  
  // Create default room arrangement from hotel room type
  const createDefaultRoomArrangement = (roomType: any, duration: number): RoomArrangement => {
    return {
      id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      roomType: roomType.name,
      numRooms: 1,
      adults: Math.min(2, roomType.maxOccupancy || 2),
      childrenWithBed: 0,
      childrenNoBed: 0,
      infants: 0,
      ratePerNight: {
        adult: roomType.ratePerNight || 80,
        childWithBed: roomType.ratePerNight * 0.75 || 60,
        childNoBed: roomType.ratePerNight * 0.5 || 40,
        infant: 0
      },
      nights: duration,
      total: roomType.ratePerNight * duration || 80 * duration
    };
  };

  // Populate room arrangements from hotel room types
  const populateRoomArrangementsFromHotel = (hotelRoomTypes: any[], duration: number) => {
    if (!hotelRoomTypes || hotelRoomTypes.length === 0 || !quote) return;
    
    // Create room arrangements from hotel room types
    const newRoomArrangements = hotelRoomTypes.map(roomType => 
      createDefaultRoomArrangement(roomType, duration)
    );
    
    // Update the quote with new room arrangements
    setQuote(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        roomArrangements: newRoomArrangements,
        travelers: {
          adults: newRoomArrangements.reduce((sum, arr) => sum + arr.adults * arr.numRooms, 0),
          childrenWithBed: 0,
          childrenNoBed: 0,
          infants: 0
        }
      };
    });
  };
  
  // Add a new room arrangement
  const addRoomArrangement = (roomType: any, duration: number) => {
    if (!quote) return;
    
    const newArrangement = createDefaultRoomArrangement(roomType, duration);
    
    setQuote(prev => {
      if (!prev) return prev;
      
      const updatedArrangements = [...prev.roomArrangements, newArrangement];
      
      // Calculate total travelers
      const totalTravelers = {
        adults: updatedArrangements.reduce((sum, arr) => sum + arr.adults * arr.numRooms, 0),
        childrenWithBed: updatedArrangements.reduce((sum, arr) => sum + arr.childrenWithBed * arr.numRooms, 0),
        childrenNoBed: updatedArrangements.reduce((sum, arr) => sum + arr.childrenNoBed * arr.numRooms, 0),
        infants: updatedArrangements.reduce((sum, arr) => sum + arr.infants * arr.numRooms, 0)
      };
      
      return {
        ...prev,
        roomArrangements: updatedArrangements,
        travelers: totalTravelers
      };
    });
  };
  
  // Handle room arrangements change
  const handleRoomArrangementsChange = (arrangements) => {
    if (!quote) return;
    
    setQuote(prev => {
      if (!prev) return prev;
      
      // Calculate total travelers from room arrangements
      const totalTravelers = calculations?.calculateTotalTravelers(arrangements);
      
      return {
        ...prev,
        roomArrangements: arrangements,
        travelers: totalTravelers || prev.travelers
      };
    });
  };
  
  // Handle save quote
  const handleSave = async () => {
    if (!quote) return;
    
    try {
      setSaving(true);
      const savedQuote = await saveQuote({
        ...quote,
        hotelId: selectedHotelId
      });
      toast.success("Quote saved successfully");
      setQuote(savedQuote);
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Failed to save quote");
    } finally {
      setSaving(false);
    }
  };
  
  // Preview quote
  const previewQuote = () => {
    if (!quote || !calculations) return;
    
    // Store the current quote data in session storage for preview
    sessionStorage.setItem('previewQuote', JSON.stringify({
      ...quote,
      subtotal: calculations.calculateSubtotal(),
      markup: {
        ...quote.markup,
        amount: calculations.calculateMarkup()
      },
      grandTotal: calculations.calculateGrandTotal(),
      perPersonCost: calculations.calculatePerPersonCost(),
      hotelId: selectedHotelId
    }));
    
    // Open in new tab
    window.open('/quote-preview', '_blank');
  };
  
  // Download quote as PDF
  const downloadQuote = () => {
    toast.success("Quote downloaded as PDF");
    // In a real app, this would generate and download a PDF
  };
  
  // Email quote to client
  const emailQuote = () => {
    toast.success("Quote sent to client via email");
    // In a real app, this would send an email
  };

  return {
    loading,
    quote,
    saving,
    selectedHotelId,
    calculations,
    handleHotelSelection,
    populateRoomArrangementsFromHotel,
    addRoomArrangement,
    handleRoomArrangementsChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote
  };
};
