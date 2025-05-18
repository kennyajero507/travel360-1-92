
import { useState, useEffect } from "react";
import { QuoteData, RoomArrangement } from "../types/quote.types";

export const useQuoteCalculations = (quoteData: QuoteData) => {
  // Calculate accommodation subtotal
  const calculateAccommodationSubtotal = () => {
    return quoteData.roomArrangements.reduce((sum, item) => sum + item.total, 0);
  };

  // Calculate activities subtotal
  const calculateActivitiesSubtotal = () => {
    return quoteData.activities.reduce((sum, item) => sum + item.total, 0);
  };

  // Calculate transport subtotal
  const calculateTransportSubtotal = () => {
    return quoteData.transports.reduce((sum, item) => sum + item.total, 0);
  };

  // Calculate subtotal (without markup)
  const calculateSubtotal = () => {
    return calculateAccommodationSubtotal() + calculateActivitiesSubtotal() + calculateTransportSubtotal();
  };

  // Calculate markup amount using the updated formula
  const calculateMarkup = () => {
    const subtotal = calculateSubtotal();
    if (quoteData.markup.type === "percentage") {
      // New formula: Full Price = Subtotal ÷ (1 - Markup%)
      // Markup amount = Full Price - Subtotal
      const markupDecimal = quoteData.markup.value / 100;
      const fullPrice = subtotal / (1 - markupDecimal);
      return fullPrice - subtotal;
    } else if (quoteData.markup.type === "cost-plus") {
      // For cost-plus, we use the same formula with 15% markup
      return (subtotal / 0.85) - subtotal;
    } else {
      // Fixed markup amount
      return quoteData.markup.value;
    }
  };

  // Calculate grand total (with markup)
  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateMarkup();
  };

  // Calculate per person cost
  const calculatePerPersonCost = () => {
    const totalTravelers = 
      quoteData.travelers.adults + 
      quoteData.travelers.childrenWithBed + 
      quoteData.travelers.childrenNoBed;
    
    return totalTravelers > 0 ? calculateGrandTotal() / totalTravelers : 0;
  };

  // Calculate total travelers from room arrangements
  const calculateTotalTravelers = (arrangements: RoomArrangement[]) => {
    const totalAdults = arrangements.reduce((sum, arr) => sum + arr.adults * arr.numRooms, 0);
    const totalCWB = arrangements.reduce((sum, arr) => sum + arr.childrenWithBed * arr.numRooms, 0);
    const totalCNB = arrangements.reduce((sum, arr) => sum + arr.childrenNoBed * arr.numRooms, 0);
    const totalInfants = arrangements.reduce((sum, arr) => sum + arr.infants * arr.numRooms, 0);
    
    return {
      adults: totalAdults,
      childrenWithBed: totalCWB,
      childrenNoBed: totalCNB,
      infants: totalInfants
    };
  };

  // Validate room arrangement (ensure not exceeding max capacity)
  const validateRoomArrangement = (arrangement: RoomArrangement): string | null => {
    const maxCapacityMap: Record<string, number> = {
      "Single Room": 1,
      "Double Room": 2,
      "Twin Room": 2,
      "Triple Room": 3,
      "Quad Room": 4,
      "Family Room": 6
    };
    
    const maxCapacity = maxCapacityMap[arrangement.roomType] || 2;
    const totalOccupants = arrangement.adults + arrangement.childrenWithBed;
    
    if (totalOccupants > maxCapacity) {
      return `Maximum capacity for ${arrangement.roomType} is ${maxCapacity} persons (excluding CNB/Infants)`;
    }
    
    return null;
  };

  return {
    calculateAccommodationSubtotal,
    calculateActivitiesSubtotal,
    calculateTransportSubtotal,
    calculateSubtotal,
    calculateMarkup,
    calculateGrandTotal,
    calculatePerPersonCost,
    calculateTotalTravelers,
    validateRoomArrangement
  };
};
