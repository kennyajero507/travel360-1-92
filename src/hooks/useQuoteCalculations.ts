
// src/hooks/useQuoteCalculations.ts
import { QuoteData, RoomArrangement } from "../types/quote.types";

export const useQuoteCalculations = (quote: QuoteData) => {

  // Calculate total travelers from room arrangements
  const calculateTotalTravelers = (arrangements: RoomArrangement[]) => {
    const totalAdults = arrangements.reduce((sum, arr) => sum + arr.adults * arr.num_rooms, 0);
    const totalCWB = arrangements.reduce((sum, arr) => sum + arr.children_with_bed * arr.num_rooms, 0);
    const totalCNB = arrangements.reduce((sum, arr) => sum + arr.children_no_bed * arr.num_rooms, 0);
    const totalInfants = arrangements.reduce((sum, arr) => sum + arr.infants * arr.num_rooms, 0);
    
    return {
      adults: totalAdults,
      childrenWithBed: totalCWB,
      childrenNoBed: totalCNB,
      infants: totalInfants
    };
  };
  
  // Calculate accommodation subtotal
  const calculateAccommodationSubtotal = () => {
    return quote.room_arrangements.reduce((sum, item) => sum + item.total, 0);
  };

  // Calculate activities subtotal
  const calculateActivitiesSubtotal = () => {
    return quote.activities?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0;
  };

  // Calculate transport subtotal
  const calculateTransportSubtotal = () => {
    return quote.transports?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0;
  };
  
  // Calculate transfers subtotal
  const calculateTransfersSubtotal = () => {
    return quote.transfers?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  };

  // Calculate overall subtotal
  const calculateSubtotal = () => {
    return (
      calculateAccommodationSubtotal() + 
      calculateActivitiesSubtotal() + 
      calculateTransportSubtotal() + 
      calculateTransfersSubtotal()
    );
  };

  // Calculate markup
  const calculateMarkup = () => {
    const subtotal = calculateSubtotal();
    const markupType = quote.markup_type || "percentage";
    const markupValue = quote.markup_value || 25;
    
    if (markupType === "percentage") {
      return (subtotal * markupValue) / 100;
    } else {
      // Fixed markup amount
      return markupValue;
    }
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateMarkup();
  };

  // Calculate per person cost
  const calculatePerPersonCost = () => {
    const totalTravelers = quote.adults + 
      quote.children_with_bed + 
      quote.children_no_bed;
      
    return totalTravelers > 0 ? calculateGrandTotal() / totalTravelers : 0;
  };

  return {
    calculateTotalTravelers,
    calculateAccommodationSubtotal,
    calculateActivitiesSubtotal,
    calculateTransportSubtotal,
    calculateTransfersSubtotal,
    calculateSubtotal,
    calculateMarkup,
    calculateGrandTotal,
    calculatePerPersonCost
  };
};
