import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { updateQuoteStatus, generateClientPreview, emailQuote as emailQuoteService } from "../services/quoteService";
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

  // Use enhanced calculations with stable dependency
  const { calculations, validation, progressData } = useEnhancedQuoteCalculations(quote);

  // Memoize the quote update handler to prevent infinite loops
  const updateQuoteStable = useCallback((updatedQuote: QuoteData) => {
    setQuote(prevQuote => {
      // Only update if the quote has actually changed
      if (!prevQuote || JSON.stringify(prevQuote) !== JSON.stringify(updatedQuote)) {
        return updatedQuote;
      }
      return prevQuote;
    });
  }, []);

  // Load quote data using enhanced service - stable dependencies
  useEffect(() => {
    let isMounted = true;
    
    const loadQuote = async () => {
      if (!quoteId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const quoteData = await enhancedQuoteService.getQuoteById(quoteId);
        
        if (!isMounted) return;
        
        if (quoteData) {
          setQuote(quoteData);
          
          // Collect selected hotels from room arrangements
          const hotels = new Set<string>();
          if (quoteData.room_arrangements && Array.isArray(quoteData.room_arrangements)) {
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
          if (quoteData.hotel_id) {
            setSelectedHotelId(quoteData.hotel_id);
          }

          // Enable auto-save for existing quotes
          enhancedQuoteService.enableAutoSave(quoteData.id, quoteData);
          setAutoSaveEnabled(true);
        }
      } catch (error) {
        console.error("Error loading quote:", error);
        if (isMounted) {
          toast.error("Failed to load quote data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadQuote();

    // Cleanup function
    return () => {
      isMounted = false;
      enhancedQuoteService.disableAutoSave();
    };
  }, [quoteId]); // Only depend on quoteId

  // Update pending changes when quote changes - stable dependencies
  useEffect(() => {
    if (quote && autoSaveEnabled && quote.id) {
      enhancedQuoteService.updatePendingChanges(quote.id, quote);
    }
  }, [quote, autoSaveEnabled]);

  // Stable handlers to prevent infinite loops
  const handleHotelSelection = useCallback((hotelId: string) => {
    setSelectedHotelId(hotelId);
    
    // Add to selected hotels if not already there
    setSelectedHotels(prev => 
      prev.includes(hotelId) ? prev : [...prev, hotelId]
    );
    
    setQuote(prevQuote => {
      if (!prevQuote) return null;
      return {
        ...prevQuote,
        hotel_id: hotelId
      };
    });
  }, []);

  const removeSelectedHotel = useCallback((hotelId: string) => {
    // Remove from selected hotels
    setSelectedHotels(prev => prev.filter(id => id !== hotelId));
    
    // Clear selected hotel ID if it was this one
    setSelectedHotelId(prev => prev === hotelId ? null : prev);
    
    // Remove room arrangements for this hotel
    setQuote(prevQuote => {
      if (!prevQuote) return null;
      return {
        ...prevQuote,
        room_arrangements: (prevQuote.room_arrangements || []).filter(arr => arr.hotel_id !== hotelId)
      };
    });
  }, []);

  const populateRoomArrangementsFromHotel = useCallback((roomTypes: any[], nights: number, hotelId?: string) => {
    const targetHotelId = hotelId || selectedHotelId;
    if (!targetHotelId || !Array.isArray(roomTypes) || roomTypes.length === 0) return;
    
    setQuote(prevQuote => {
      if (!prevQuote) return null;
      
      // Don't modify existing arrangements for this hotel
      if (prevQuote.room_arrangements?.some(arr => arr.hotel_id === targetHotelId)) {
        return prevQuote;
      }
      
      const firstRoomType = roomTypes[0];
      const newArrangement: RoomArrangement = {
        id: `room-${Date.now()}`,
        hotel_id: targetHotelId,
        room_type: firstRoomType.name || 'Standard Room',
        num_rooms: 1,
        adults: prevQuote.adults || 1,
        children_with_bed: prevQuote.children_with_bed || 0,
        children_no_bed: prevQuote.children_no_bed || 0,
        infants: prevQuote.infants || 0,
        rate_per_night: {
          adult: firstRoomType.rate || 100,
          childWithBed: firstRoomType.childRate || 70,
          childNoBed: firstRoomType.childNoBedrRate || 40,
          infant: 0
        },
        nights: nights,
        total: calculateRoomTotal({
          adults: prevQuote.adults || 1,
          children_with_bed: prevQuote.children_with_bed || 0,
          children_no_bed: prevQuote.children_no_bed || 0,
          infants: prevQuote.infants || 0,
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
      
      return {
        ...prevQuote,
        room_arrangements: [...(prevQuote.room_arrangements || []), newArrangement]
      };
    });
  }, [selectedHotelId]);

  // Calculate total cost for a room arrangement
  const calculateRoomTotal = useCallback((room: Partial<RoomArrangement>) => {
    if (!room.rate_per_night || !room.nights || !room.num_rooms) return 0;
    
    return room.num_rooms * (
      ((room.adults || 0) * room.rate_per_night.adult * room.nights) +
      ((room.children_with_bed || 0) * room.rate_per_night.childWithBed * room.nights) +
      ((room.children_no_bed || 0) * room.rate_per_night.childNoBed * room.nights) +
      ((room.infants || 0) * room.rate_per_night.infant * room.nights)
    );
  }, []);

  const handleRoomArrangementsChange = useCallback((arrangements: RoomArrangement[]) => {
    if (!Array.isArray(arrangements)) return;
    
    // Calculate totals for each room arrangement
    const updatedArrangements = arrangements.map(arr => ({
      ...arr,
      total: calculateRoomTotal(arr)
    }));
    
    setQuote(prevQuote => {
      if (!prevQuote) return null;
      return {
        ...prevQuote,
        room_arrangements: updatedArrangements
      };
    });
  }, [calculateRoomTotal]);

  const handleTransfersChange = useCallback((transfers: any[]) => {
    if (!Array.isArray(transfers)) return;
    
    setQuote(prevQuote => {
      if (!prevQuote) return null;
      return {
        ...prevQuote,
        transfers
      };
    });
  }, []);

  const handleTransportsChange = useCallback((transports: any[]) => {
    if (!Array.isArray(transports)) return;
    
    setQuote(prevQuote => {
      if (!prevQuote) return null;
      return {
        ...prevQuote,
        transports
      };
    });
  }, []);

  const handleActivitiesChange = useCallback((activities: any[]) => {
    if (!Array.isArray(activities)) return;
    
    setQuote(prevQuote => {
      if (!prevQuote) return null;
      return {
        ...prevQuote,
        activities
      };
    });
  }, []);

  // Enhanced preview function for client view
  const previewQuote = useCallback(async () => {
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
  }, [quote]);
  
  // Handle stage changes
  const handleStageChange = useCallback((stage: 'hotel-selection' | 'quote-details') => {
    // Only allow proceeding to quote details if hotels are selected
    if (stage === 'quote-details' && !isHotelSelectionComplete()) {
      toast.error("Please select at least one hotel and add room arrangements before proceeding");
      return;
    }
    
    setEditorStage(stage);
  }, []);

  // Save the quote using enhanced service
  const handleSave = useCallback(async () => {
    if (!quote) return;
    
    // Check if hotel selection is required first
    if (editorStage === 'hotel-selection' && !isHotelSelectionComplete()) {
      toast.error("Please select at least one hotel and add room arrangements before saving");
      return;
    }
    
    setSaving(true);
    try {
      const savedQuote = await enhancedQuoteService.saveQuote(quote);
      updateQuoteStable(savedQuote);
      
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
  }, [quote, editorStage, updateQuoteStable]);

  // Email the quote
  const emailQuote = useCallback(async () => {
    if (!quote) return;
    
    if (!isHotelSelectionComplete()) {
      toast.error("Please complete hotel selection before emailing");
      return;
    }
    
    try {
      await emailQuoteService(quote.id!);
      // Update status to sent on success
      await updateQuoteStatus(quote.id!, "sent");
      updateQuoteStable({
        ...quote,
        status: "sent" as const
      });
    } catch (error) {
      // The service already toasts on error, so we just log it here.
      console.error("Error sending quote email from hook:", error);
    }
  }, [quote, updateQuoteStable, isHotelSelectionComplete]);
  
  // Download the quote
  const downloadQuote = useCallback(() => {
    if (!quote) return;
    
    if (!isHotelSelectionComplete()) {
      toast.error("Please complete hotel selection before downloading");
      return;
    }
    
    toast.success("Quote downloaded as PDF");
    // In a real app, this would generate and download a PDF
  }, [quote]);

  // Check if hotel selection is complete
  const isHotelSelectionComplete = useCallback(() => {
    if (!quote) return false;
    
    // Must have at least one hotel with room arrangements
    return (
      selectedHotels.length > 0 && 
      selectedHotels.every(hotelId => 
        quote.room_arrangements?.some(arr => arr.hotel_id === hotelId)
      )
    );
  }, [quote, selectedHotels]);

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
