import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getQuoteById, saveQuote, updateQuoteStatus, generateClientPreview } from "../services/quoteService";
import { QuoteData, RoomArrangement } from "../types/quote.types";

export const useQuoteEditor = (quoteId?: string, role?: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [editorStage, setEditorStage] = useState<'hotel-selection' | 'quote-details'>('hotel-selection');
  const navigate = useNavigate();

  // Load quote data
  useEffect(() => {
    const loadQuote = async () => {
      if (quoteId) {
        setLoading(true);
        try {
          const quoteData = await getQuoteById(quoteId);
          setQuote(quoteData);
          
          // Collect selected hotels from room arrangements
          const hotels = new Set<string>();
          if (quoteData?.roomArrangements && quoteData.roomArrangements.length > 0) {
            quoteData.roomArrangements.forEach(arr => {
              if (arr.hotelId) {
                hotels.add(arr.hotelId);
              }
            });
            setSelectedHotels(Array.from(hotels));
            
            // If hotels are already selected, go directly to quote details
            if (hotels.size > 0) {
              setEditorStage('quote-details');
            }
          }
          
          // Set selected hotel if present in the quote
          if (quoteData?.hotelId) {
            setSelectedHotelId(quoteData.hotelId);
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
  }, [quoteId]);

  // Handlers for quote modifications
  const handleHotelSelection = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    
    // Add to selected hotels if not already there
    if (!selectedHotels.includes(hotelId)) {
      setSelectedHotels([...selectedHotels, hotelId]);
    }
    
    if (quote) {
      setQuote({
        ...quote,
        hotelId: hotelId
      });
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
      setQuote({
        ...quote,
        roomArrangements: quote.roomArrangements.filter(arr => arr.hotelId !== hotelId)
      });
    }
  };

  const populateRoomArrangementsFromHotel = (roomTypes: any[], nights: number, hotelId?: string) => {
    if (!quote) return;
    
    const targetHotelId = hotelId || selectedHotelId;
    if (!targetHotelId) return;
    
    // Don't modify existing arrangements for this hotel
    if (quote.roomArrangements.some(arr => arr.hotelId === targetHotelId)) return;
    
    // Create a new room arrangement based on the first room type
    if (roomTypes.length > 0) {
      const firstRoomType = roomTypes[0];
      
      const newArrangement: RoomArrangement = {
        id: `room-${Date.now()}`,
        hotelId: targetHotelId,
        roomType: firstRoomType.name,
        numRooms: 1,
        adults: quote.travelers.adults,
        childrenWithBed: quote.travelers.childrenWithBed,
        childrenNoBed: quote.travelers.childrenNoBed,
        infants: quote.travelers.infants,
        ratePerNight: {
          adult: firstRoomType.rate || 100,
          childWithBed: firstRoomType.childRate || 70,
          childNoBed: firstRoomType.childNoBedrRate || 40,
          infant: 0
        },
        nights: nights,
        total: calculateRoomTotal({
          adults: quote.travelers.adults,
          childrenWithBed: quote.travelers.childrenWithBed,
          childrenNoBed: quote.travelers.childrenNoBed,
          infants: quote.travelers.infants,
          ratePerNight: {
            adult: firstRoomType.rate || 100,
            childWithBed: firstRoomType.childRate || 70,
            childNoBed: firstRoomType.childNoBedrRate || 40,
            infant: 0
          },
          numRooms: 1,
          nights: nights
        })
      };
      
      setQuote({
        ...quote,
        roomArrangements: [...quote.roomArrangements, newArrangement]
      });
    }
  };

  const addRoomArrangement = (roomType: any, nights: number, hotelId?: string) => {
    if (!quote) return;
    
    const targetHotelId = hotelId || selectedHotelId;
    if (!targetHotelId) return;
    
    const newArrangement: RoomArrangement = {
      id: `room-${Date.now()}`,
      hotelId: targetHotelId,
      roomType: roomType.name,
      numRooms: 1,
      adults: 2,
      childrenWithBed: 0,
      childrenNoBed: 0,
      infants: 0,
      ratePerNight: {
        adult: roomType.rate || 100,
        childWithBed: roomType.childRate || 70,
        childNoBed: roomType.childNoBedrRate || 40,
        infant: 0
      },
      nights: nights,
      total: calculateRoomTotal({
        adults: 2,
        childrenWithBed: 0,
        childrenNoBed: 0,
        infants: 0,
        ratePerNight: {
          adult: roomType.rate || 100,
          childWithBed: roomType.childRate || 70,
          childNoBed: roomType.childNoBedrRate || 40,
          infant: 0
        },
        numRooms: 1,
        nights: nights
      })
    };
    
    setQuote({
      ...quote,
      roomArrangements: [...quote.roomArrangements, newArrangement]
    });
  };

  // Calculate total cost for a room arrangement
  const calculateRoomTotal = (room: Partial<RoomArrangement>) => {
    if (!room.ratePerNight || !room.nights) return 0;
    
    return room.numRooms! * (
      (room.adults! * room.ratePerNight.adult * room.nights) +
      (room.childrenWithBed! * room.ratePerNight.childWithBed * room.nights) +
      (room.childrenNoBed! * room.ratePerNight.childNoBed * room.nights) +
      (room.infants! * room.ratePerNight.infant * room.nights)
    );
  };

  const handleRoomArrangementsChange = (arrangements: RoomArrangement[]) => {
    if (!quote) return;
    
    // Calculate totals for each room arrangement
    const updatedArrangements = arrangements.map(arr => ({
      ...arr,
      total: calculateRoomTotal(arr)
    }));
    
    setQuote({
      ...quote,
      roomArrangements: updatedArrangements
    });
  };

  const handleTransfersChange = (transfers: any[]) => {
    if (!quote) return;
    
    setQuote({
      ...quote,
      transfers
    });
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

  // Save the quote
  const handleSave = async () => {
    if (!quote) return;
    
    // Check if hotel selection is required first
    if (editorStage === 'hotel-selection' && !isHotelSelectionComplete()) {
      toast.error("Please select at least one hotel and add room arrangements before saving");
      return;
    }
    
    setSaving(true);
    try {
      const savedQuote = await saveQuote(quote);
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
      setQuote({
        ...quote,
        status: "sent"
      });
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
        quote.roomArrangements.some(arr => arr.hotelId === hotelId)
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
    handleStageChange,
    handleHotelSelection,
    removeSelectedHotel,
    populateRoomArrangementsFromHotel,
    addRoomArrangement,
    handleRoomArrangementsChange,
    handleTransfersChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote,
    isHotelSelectionComplete
  };
};
