
import { markupService, MarkupCalculation } from "../services/markupService";

export interface HotelComparisonData {
  hotel: any;
  basePrice: number;
  finalPrice: number;
  markupCalculation: MarkupCalculation;
  roomArrangements: any[];
  transfers: any[];
  activities: any[];
  perPersonCost: number;
}

export class ReverseMarkupCalculator {
  static calculateHotelComparison(
    hotel: any,
    roomArrangements: any[],
    transfers: any[] = [],
    activities: any[] = [],
    markupPercentage: number = 25,
    totalTravelers: number = 1
  ): HotelComparisonData {
    // Calculate base costs
    const accommodationCost = roomArrangements.reduce((sum, arr) => sum + (arr.total || 0), 0);
    const transfersCost = transfers.reduce((sum, transfer) => sum + (transfer.total || 0), 0);
    const activitiesCost = activities.reduce((sum, activity) => sum + (activity.total_cost || 0), 0);
    
    const basePrice = accommodationCost + transfersCost + activitiesCost;
    
    // Calculate final price with markup using forward calculation
    const markupCalculation = markupService.calculateWithMarkup(basePrice, markupPercentage);
    
    const perPersonCost = totalTravelers > 0 ? markupCalculation.finalPrice / totalTravelers : markupCalculation.finalPrice;

    return {
      hotel,
      basePrice,
      finalPrice: markupCalculation.finalPrice,
      markupCalculation,
      roomArrangements,
      transfers,
      activities,
      perPersonCost
    };
  }

  static compareHotels(
    hotel1Data: HotelComparisonData,
    hotel2Data: HotelComparisonData
  ) {
    const priceDifference = hotel2Data.finalPrice - hotel1Data.finalPrice;
    const percentageDifference = hotel1Data.finalPrice > 0 
      ? (priceDifference / hotel1Data.finalPrice) * 100 
      : 0;

    return {
      cheaperHotel: priceDifference > 0 ? hotel1Data.hotel : hotel2Data.hotel,
      priceDifference: Math.abs(priceDifference),
      percentageDifference: Math.abs(percentageDifference),
      savings: Math.abs(priceDifference)
    };
  }
}
