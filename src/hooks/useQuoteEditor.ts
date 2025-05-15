
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuoteData } from "../types/quote.types";
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
    handleRoomArrangementsChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote
  };
};
