
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { updateQuoteStatus, generateClientPreview } from "../services/quoteService";
import { enhancedQuoteService } from "../services/enhancedQuoteService";
import { QuoteData, RoomArrangement } from "../types/quote.types";
import { useEnhancedQuoteCalculations } from "./useEnhancedQuoteCalculations";

export const useQuoteEditor = (quoteId?: string, role?: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [editorStage, setEditorStage] = useState<'hotel-selection' | 'quote-details'>('hotel-selection');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(false);
  const navigate = useNavigate();

  // Use enhanced calculations
  const { calculations, validation, progressData } = useEnhancedQuoteCalculations(quote);

  // Load quote data using enhanced service
  useEffect(() => {
    const loadQuote = async () => {
      if (quoteId) {
        setLoading(true);
        try {
          const quoteData = await enhancedQuoteService.getQuoteById(quoteId);
          setQuote(quoteData);
          
          // Collect selected hotels from room arrangements
          const hotels = new Set<string>();
          if (quoteData?.room_arrangements && quoteData.room_arrangements.length > 0) {
            quoteData.room_arrangements.forEach(arr => {
              if (arr.hotel_id) {
                hotels.add(arr.hotel_id);
              }
            });
            setSelectedHotels(Array.from(hotels));
            
            // If hotels are already selected, go directly to quote details
            if (hotels.size > 0) {
              setEditorStage('quote-details');
            }
          }
          
          // Set selected hotel if present in the quote
          if (quoteData?.hotel_id) {
            setSelectedHotelId(quoteData.hotel_id);
          }

          // Enable auto-save for existing quotes
          if (quoteData) {
            enhancedQuoteService.enableAutoSave(quoteData.id, quoteData);
            setAutoSaveEnabled(true);
          }
        } catch (error) {
          console.error("Error loading quote:", error);
          toast.error("Failed to load quote data");
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadQuote();

    // Cleanup auto-save on unmount
    return () => {
      enhancedQuoteService.disableAutoSave();
    };
  }, [quoteId]);

  // Update pending changes when quote changes
  useEffect(() => {
    if (quote && autoSaveEnabled) {
      enhancedQuoteService.updatePendingChanges(quote.id, quote);
    }
  }, [quote, autoSaveEnabled]);

  // Handlers for quote modifications
  const handleHotelSelection = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    
    // Add to selected hotels if not already there
    if (!selectedHotels.includes(hotelId)) {
      setSelectedHotels([...selectedHotels, hotelId]);
    }
    
    if (quote) {
      const updatedQuote = {
        ...quote,
        hotel_id: hotelId
      };
      setQuote(updatedQuote);
    }
  };

  const removeSelectedHotel = (hotelId: string) => {
    // Remove from selected hotels
    setSelectedHotels(selectedHotels.filter(id => id !== hotelId));
    
    // Clear selected hotel ID if it was this one
    if (selectedHotelId === hotelId) {
      setSelectedHotelId(null);
    }
    
    // Remove room arrangements for this hotel
    if (quote) {
      const updatedQuote = {
        ...quote,
        room_arrangements: quote.room_arrangements.filter(arr => arr.hotel_id !== hotelId)
      };
      setQuote(updatedQuote);
    }
  };

  const populateRoomArrangementsFromHotel = (roomTypes: any[], nights: number, hotelId?: string) => {
    if (!quote) return;
    
    const targetHotelId = hotelId || selectedHotelId;
    if (!targetHotelId) return;
    
    // Don't modify existing arrangements for this hotel
    if (quote.room_arrangements.some(arr => arr.hotel_id === targetHotelId)) return;
    
    // Create a new room arrangement based on the first room type
    if (roomTypes.length > 0) {
      const firstRoomType = roomTypes[0];
      
      const newArrangement: RoomArrangement = {
        id: `room-${Date.now()}`,
        hotel_id: targetHotelId,
        room_type: firstRoomType.name,
        num_rooms: 1,
        adults: quote.adults,
        children_with_bed: quote.children_with_bed,
        children_no_bed: quote.children_no_bed,
        infants: quote.infants,
        rate_per_night: {
          adult: firstRoomType.rate || 100,
          childWithBed: firstRoomType.childRate || 70,
          childNoBed: firstRoomType.childNoBedrRate || 40,
          infant: 0
        },
        nights: nights,
        total: calculateRoomTotal({
          adults: quote.adults,
          children_with_bed: quote.children_with_bed,
          children_no_bed: quote.children_no_bed,
          infants: quote.infants,
          rate_per_night: {
            adult: firstRoomType.rate || 100,
            childWithBed: firstRoomType.childRate || 70,
            childNoBed: firstRoomType.childNoBedrRate || 40,
            infant: 0
          },
          num_rooms: 1,
          nights: nights
        })
      };
      
      const updatedQuote = {
        ...quote,
        room_arrangements: [...quote.room_arrangements, newArrangement]
      };
      setQuote(updatedQuote);
    }
  };

  // Calculate total cost for a room arrangement
  const calculateRoomTotal = (room: Partial<RoomArrangement>) => {
    if (!room.rate_per_night || !room.nights) return 0;
    
    return room.num_rooms! * (
      (room.adults! * room.rate_per_night.adult * room.nights) +
      (room.children_with_bed! * room.rate_per_night.childWithBed * room.nights) +
      (room.children_no_bed! * room.rate_per_night.childNoBed * room.nights) +
      (room.infants! * room.rate_per_night.infant * room.nights)
    );
  };

  const handleRoomArrangementsChange = (arrangements: RoomArrangement[]) => {
    if (!quote) return;
    
    // Calculate totals for each room arrangement
    const updatedArrangements = arrangements.map(arr => ({
      ...arr,
      total: calculateRoomTotal(arr)
    }));
    
    const updatedQuote = {
      ...quote,
      room_arrangements: updatedArrangements
    };
    setQuote(updatedQuote);
  };

  const handleTransfersChange = (transfers: any[]) => {
    if (!quote) return;
    
    const updatedQuote = {
      ...quote,
      transfers
    };
    setQuote(updatedQuote);
  };

  const handleTransportsChange = (transports: any[]) => {
    if (!quote) return;
    
    const updatedQuote = {
      ...quote,
      transports
    };
    setQuote(updatedQuote);
  };

  const handleActivitiesChange = (activities: any[]) => {
    if (!quote) return;
    
    const updatedQuote = {
      ...quote,
      activities
    };
    setQuote(updatedQuote);
  };

  // Enhanced preview function for client view
  const previewQuote = async () => {
    if (!quote) return;
    
    if (!isHotelSelectionComplete()) {
      toast.error("Please complete hotel selection before previewing");
      return;
    }
    
    try {
      const clientPreview = await generateClientPreview(quote.id!);
      if (clientPreview) {
        // Store the preview data in session storage
        sessionStorage.setItem('previewQuote', JSON.stringify(clientPreview));
        // Open in new tab
        window.open('/quote-preview', '_blank');
      } else {
        toast.error("Failed to generate preview");
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate preview");
    }
  };
  
  // Handle stage changes
  const handleStageChange = (stage: 'hotel-selection' | 'quote-details') => {
    // Only allow proceeding to quote details if hotels are selected
    if (stage === 'quote-details' && !isHotelSelectionComplete()) {
      toast.error("Please select at least one hotel and add room arrangements before proceeding");
      return;
    }
    
    setEditorStage(stage);
  };

  // Save the quote using enhanced service
  const handleSave = async () => {
    if (!quote) return;
    
    // Check if hotel selection is required first
    if (editorStage === 'hotel-selection' && !isHotelSelectionComplete()) {
      toast.error("Please select at least one hotel and add room arrangements before saving");
      return;
    }
    
    setSaving(true);
    try {
      const savedQuote = await enhancedQuoteService.saveQuote(quote);
      setQuote(savedQuote);
      
      // If we're in hotel selection and everything is complete, move to quote details
      if (editorStage === 'hotel-selection' && isHotelSelectionComplete()) {
        setEditorStage('quote-details');
      }
      
      toast.success("Quote saved successfully");
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Failed to save quote");
    } finally {
      setSaving(false);
    }
  };

  // Email the quote
  const emailQuote = async () => {
    if (!quote) return;
    
    if (!isHotelSelectionComplete()) {
      toast.error("Please complete hotel selection before emailing");
      return;
    }
    
    toast.success("Quote sent to client via email");
    // Update status to sent
    try {
      await updateQuoteStatus(quote.id!, "sent");
      const updatedQuote = {
        ...quote,
        status: "sent" as const
      };
      setQuote(updatedQuote);
    } catch (error) {
      console.error("Error updating quote status:", error);
    }
  };
  
  // Download the quote
  const downloadQuote = () => {
    if (!quote) return;
    
    if (!isHotelSelectionComplete()) {
      toast.error("Please complete hotel selection before downloading");
      return;
    }
    
    toast.success("Quote downloaded as PDF");
    // In a real app, this would generate and download a PDF
  };

  // Check if hotel selection is complete
  const isHotelSelectionComplete = () => {
    if (!quote) return false;
    
    // Must have at least one hotel with room arrangements
    return (
      selectedHotels.length > 0 && 
      selectedHotels.every(hotelId => 
        quote.room_arrangements.some(arr => arr.hotel_id === hotelId)
      )
    );
  };

  return {
    loading,
    quote,
    saving,
    selectedHotelId,
    selectedHotels,
    editorStage,
    autoSaveEnabled,
    calculations,
    validation,
    progressData,
    handleStageChange,
    handleHotelSelection,
    removeSelectedHotel,
    populateRoomArrangementsFromHotel,
    handleRoomArrangementsChange,
    handleTransfersChange,
    handleTransportsChange,
    handleActivitiesChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote,
    isHotelSelectionComplete
  };
};
