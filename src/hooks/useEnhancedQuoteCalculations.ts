
import { useMemo } from "react";
import { QuoteData, QuoteCalculations, QuoteValidation } from "../types/quote.types";
import { ReverseMarkupCalculator } from "../utils/reverseMarkupCalculator";

export const useEnhancedQuoteCalculations = (quote: QuoteData | null) => {
  const calculations = useMemo((): QuoteCalculations => {
    if (!quote) {
      return {
        accommodation_subtotal: 0,
        transport_subtotal: 0,
        transfer_subtotal: 0,
        excursion_subtotal: 0,
        subtotal: 0,
        markup_amount: 0,
        total_amount: 0,
        per_person_cost: 0,
        section_markups: {}
      };
    }

    const accommodation_subtotal = quote.room_arrangements?.reduce((sum, arr) => sum + (arr.total || 0), 0) || 0;
    const transport_subtotal = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
    const transfer_subtotal = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
    const excursion_subtotal = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;

    const subtotal = accommodation_subtotal + transport_subtotal + transfer_subtotal + excursion_subtotal;

    // Calculate markup using reverse percentage formula
    let markup_amount = 0;
    if (quote.markup_type === 'percentage') {
      markup_amount = (subtotal * (quote.markup_value || 0)) / 100;
    } else {
      markup_amount = quote.markup_value || 0;
    }

    const total_amount = subtotal + markup_amount;
    const totalTravelers = quote.adults + quote.children_with_bed + quote.children_no_bed;
    const per_person_cost = totalTravelers > 0 ? total_amount / totalTravelers : 0;

    return {
      accommodation_subtotal,
      transport_subtotal,
      transfer_subtotal,
      excursion_subtotal,
      subtotal,
      markup_amount,
      total_amount,
      per_person_cost,
      section_markups: {}
    };
  }, [quote]);

  const validation = useMemo((): QuoteValidation => {
    if (!quote) {
      return {
        isValid: false,
        errors: ['No quote data'],
        warnings: [],
        completionPercentage: 0
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    let completedSections = 0;
    const totalSections = 6;

    // Basic validation
    if (!quote.client?.trim()) errors.push('Client name required');
    if (!quote.mobile?.trim()) errors.push('Client mobile required');
    if (!quote.destination?.trim()) errors.push('Destination required');

    // Hotel selection validation (must have exactly 2 hotels for comparison)
    const uniqueHotels = new Set();
    quote.room_arrangements?.forEach(arr => {
      if (arr.hotel_id) uniqueHotels.add(arr.hotel_id);
    });

    if (uniqueHotels.size === 0) {
      errors.push('Please select hotels for comparison');
    } else if (uniqueHotels.size === 1) {
      warnings.push('Single hotel selected. Consider adding a second hotel for comparison.');
      completedSections += 1;
    } else if (uniqueHotels.size === 2) {
      completedSections += 1;
    } else if (uniqueHotels.size > 2) {
      warnings.push('More than 2 hotels selected. Consider limiting to 2 for optimal comparison.');
      completedSections += 1;
    }

    // Section completion checks
    if (quote.room_arrangements && quote.room_arrangements.length > 0) completedSections += 1;
    if (quote.transports && quote.transports.length > 0) completedSections += 1;
    if (quote.transfers && quote.transfers.length > 0) completedSections += 1;
    if (quote.activities && quote.activities.length > 0) completedSections += 1;
    if (calculations.total_amount > 0) completedSections += 1;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completionPercentage: (completedSections / totalSections) * 100
    };
  }, [quote, calculations]);

  const progressData = useMemo(() => {
    const sections = [
      { name: 'Client Details', completed: !!quote?.client },
      { name: 'Hotel Selection', completed: quote?.room_arrangements && quote.room_arrangements.length > 0 },
      { name: 'Room Arrangements', completed: calculations.accommodation_subtotal > 0 },
      { name: 'Transport', completed: calculations.transport_subtotal > 0 },
      { name: 'Transfers', completed: calculations.transfer_subtotal > 0 },
      { name: 'Activities', completed: calculations.excursion_subtotal > 0 }
    ];

    const completedCount = sections.filter(s => s.completed).length;
    const percentage = (completedCount / sections.length) * 100;

    return {
      sections,
      completedCount,
      totalSections: sections.length,
      percentage
    };
  }, [quote, calculations]);

  return {
    calculations,
    validation,
    progressData
  };
};
