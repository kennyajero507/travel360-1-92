
export interface MarkupCalculation {
  basePrice: number;
  markupPercentage: number;
  markupAmount: number;
  finalPrice: number;
}

export class MarkupService {
  // Forward calculation: Base price + markup = Final price
  calculateWithMarkup(basePrice: number, markupPercentage: number): MarkupCalculation {
    const markupAmount = (basePrice * markupPercentage) / 100;
    const finalPrice = basePrice + markupAmount;
    
    return {
      basePrice,
      markupPercentage,
      markupAmount,
      finalPrice
    };
  }

  // Reverse calculation: Final price - markup = Base price
  calculateFromFinalPrice(finalPrice: number, markupPercentage: number): MarkupCalculation {
    // If final price includes markup, we need to reverse calculate
    // finalPrice = basePrice + (basePrice * markup/100)
    // finalPrice = basePrice * (1 + markup/100)
    // basePrice = finalPrice / (1 + markup/100)
    
    const basePrice = finalPrice / (1 + markupPercentage / 100);
    const markupAmount = finalPrice - basePrice;
    
    return {
      basePrice,
      markupPercentage,
      markupAmount,
      finalPrice
    };
  }

  // Calculate margin percentage from markup percentage
  calculateMarginFromMarkup(markupPercentage: number): number {
    return (markupPercentage / (100 + markupPercentage)) * 100;
  }

  // Calculate markup percentage from margin percentage
  calculateMarkupFromMargin(marginPercentage: number): number {
    return (marginPercentage / (100 - marginPercentage)) * 100;
  }
}

export const markupService = new MarkupService();
