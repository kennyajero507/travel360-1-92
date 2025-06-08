
export interface MarkupCalculation {
  basePrice: number;
  markupPercentage: number;
  markupAmount: number;
  finalPrice: number;
}

export const markupService = {
  /**
   * Calculate final price with markup using reverse percentage formula
   * Formula: Final Price = Base Price * (1 + markup/100)
   */
  calculateWithMarkup(basePrice: number, markupPercentage: number): MarkupCalculation {
    const markupAmount = (basePrice * markupPercentage) / 100;
    const finalPrice = basePrice + markupAmount;
    
    return {
      basePrice,
      markupPercentage,
      markupAmount,
      finalPrice
    };
  },

  /**
   * Calculate base price from final price (reverse calculation)
   * Formula: Base Price = Final Price / (1 + markup/100)
   */
  calculateBaseFromFinal(finalPrice: number, markupPercentage: number): MarkupCalculation {
    const basePrice = finalPrice / (1 + markupPercentage / 100);
    const markupAmount = finalPrice - basePrice;
    
    return {
      basePrice,
      markupPercentage,
      markupAmount,
      finalPrice
    };
  },

  /**
   * Calculate markup percentage from base and final prices
   * Formula: Markup % = ((Final Price - Base Price) / Base Price) * 100
   */
  calculateMarkupPercentage(basePrice: number, finalPrice: number): number {
    if (basePrice === 0) return 0;
    return ((finalPrice - basePrice) / basePrice) * 100;
  }
};
