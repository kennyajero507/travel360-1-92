
import { useMemo } from "react";
import { QuoteData, QuoteCalculations, QuoteValidation } from "../types/quote.types";
import { enhancedQuoteService } from "../services/enhancedQuoteService";

export const useEnhancedQuoteCalculations = (quote: QuoteData | null) => {
  const calculations = useMemo((): QuoteCalculations | null => {
    if (!quote) return null;
    return enhancedQuoteService.calculateQuoteTotals(quote);
  }, [quote]);

  const validation = useMemo((): QuoteValidation | null => {
    if (!quote) return null;
    return enhancedQuoteService.validateQuote(quote);
  }, [quote]);

  const sectionTotals = useMemo(() => {
    if (!calculations) return null;
    
    return {
      accommodation: calculations.accommodation_subtotal,
      transport: calculations.transport_subtotal,
      transfer: calculations.transfer_subtotal,
      excursion: calculations.excursion_subtotal,
      markup: calculations.markup_amount,
      total: calculations.total_amount
    };
  }, [calculations]);

  const progressData = useMemo(() => {
    if (!validation) return null;
    
    return {
      percentage: validation.completionPercentage,
      completedSections: Math.floor((validation.completionPercentage / 100) * 6),
      totalSections: 6,
      hasErrors: validation.errors.length > 0,
      hasWarnings: validation.warnings.length > 0
    };
  }, [validation]);

  return {
    calculations,
    validation,
    sectionTotals,
    progressData,
    // Helper functions
    isValid: validation?.isValid ?? false,
    completionPercentage: validation?.completionPercentage ?? 0,
    totalAmount: calculations?.total_amount ?? 0,
    perPersonCost: calculations?.per_person_cost ?? 0
  };
};
