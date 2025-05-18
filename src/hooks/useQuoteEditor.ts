
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getQuoteById, saveQuote, updateQuoteStatus } from "../services/quoteService";
import { QuoteData, RoomArrangement } from "../types/quote.types";

export const useQuoteEditor = (quoteId?: string, role?: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load quote data
  useEffect(() => {
    const loadQuote = async () => {
      if (quoteId) {
        setLoading(true);
        try {
          const quoteData = await getQuoteById(quoteId);
          setQuote(quoteData);
          
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
    if (quote) {
      setQuote({
        ...quote,
        hotelId: hotelId
      });
    }
  };

  const populateRoomArrangementsFromHotel = (roomTypes: any[], nights: number) => {
    if (!quote) return;
    
    // Don't modify existing arrangements
    if (quote.roomArrangements.some(arr => arr.hotelId === selectedHotelId)) return;
    
    // Create a new room arrangement based on the first room type
    if (roomTypes.length > 0) {
      const firstRoomType = roomTypes[0];
      
      const newArrangement: RoomArrangement = {
        id: `room-${Date.now()}`,
        hotelId: selectedHotelId || undefined,
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

  const addRoomArrangement = (roomType: any, nights: number) => {
    if (!quote) return;
    
    const newArrangement: RoomArrangement = {
      id: `room-${Date.now()}`,
      hotelId: selectedHotelId || undefined,
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

  // Save the quote
  const handleSave = async () => {
    if (!quote) return;
    
    setSaving(true);
    try {
      const savedQuote = await saveQuote(quote);
      setQuote(savedQuote);
      toast.success("Quote saved successfully");
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Failed to save quote");
    } finally {
      setSaving(false);
    }
  };

  // Preview, email, and download functions
  const previewQuote = () => {
    if (!quote) return;
    
    // Store the current quote data in session storage for preview
    sessionStorage.setItem('previewQuote', JSON.stringify(quote));
    // Open in new tab
    window.open('/quote-preview', '_blank');
  };
  
  const emailQuote = async () => {
    if (!quote) return;
    
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
  
  const downloadQuote = () => {
    toast.success("Quote downloaded as PDF");
    // In a real app, this would generate and download a PDF
  };

  return {
    loading,
    quote,
    saving,
    selectedHotelId,
    handleHotelSelection,
    populateRoomArrangementsFromHotel,
    addRoomArrangement,
    handleRoomArrangementsChange,
    handleTransfersChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote
  };
};
