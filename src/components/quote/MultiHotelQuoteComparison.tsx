
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Hotel, DollarSign, Users, Calendar, MapPin, Star } from "lucide-react";
import { QuoteData } from "../../types/quote.types";
import { markupService } from "../../services/markupService";
import { useCurrency } from "../../contexts/CurrencyContext";

interface MultiHotelQuoteComparisonProps {
  quote: QuoteData;
  hotels: any[];
  viewMode: 'agent' | 'client';
  markupPercentage: number;
  onSelectHotel?: (hotelId: string) => void;
}

const MultiHotelQuoteComparison: React.FC<MultiHotelQuoteComparisonProps> = ({
  quote,
  hotels,
  viewMode,
  markupPercentage,
  onSelectHotel
}) => {
  const { formatAmount } = useCurrency();

  const hotelComparisons = useMemo(() => {
    if (!hotels || hotels.length === 0 || !quote) {
      return [];
    }

    return hotels.map(hotel => {
      // Calculate costs for this hotel
      const hotelRoomArrangements = quote.room_arrangements?.filter(arr => arr.hotel_id === hotel.id) || [];
      const hotelTransfers = quote.transfers?.filter(t => t.hotel_id === hotel.id) || [];
      const hotelActivities = quote.activities?.filter(a => a.hotel_id === hotel.id) || [];
      
      const accommodationCost = hotelRoomArrangements.reduce((sum, arr) => sum + (arr.total || 0), 0);
      const transfersCost = hotelTransfers.reduce((sum, transfer) => sum + (transfer.total || 0), 0);
      const activitiesCost = hotelActivities.reduce((sum, activity) => sum + (activity.total_cost || 0), 0);
      
      const basePrice = accommodationCost + transfersCost + activitiesCost;
      const markupCalculation = markupService.calculateWithMarkup(basePrice, markupPercentage);
      
      const totalTravelers = (quote.adults || 0) + (quote.children_with_bed || 0) + (quote.children_no_bed || 0) + (quote.infants || 0);
      const pricePerPerson = totalTravelers > 0 ? markupCalculation.finalPrice / totalTravelers : markupCalculation.finalPrice;

      return {
        hotel,
        basePrice,
        finalPrice: markupCalculation.finalPrice,
        markupAmount: markupCalculation.markupAmount,
        pricePerPerson,
        accommodationCost,
        transfersCost,
        activitiesCost,
        roomArrangements: hotelRoomArrangements,
        transfers: hotelTransfers,
        activities: hotelActivities
      };
    });
  }, [quote, hotels, markupPercentage]);

  const cheapestOption = useMemo(() => {
    if (hotelComparisons.length === 0) {
      return null;
    }
    
    return hotelComparisons.reduce((cheapest, current) => 
      current.finalPrice < cheapest.finalPrice ? current : cheapest
    );
  }, [hotelComparisons]);

  const savings = useMemo(() => {
    if (hotelComparisons.length < 2) return null;
    const [option1, option2] = hotelComparisons;
    const difference = Math.abs(option1.finalPrice - option2.finalPrice);
    const maxPrice = Math.max(option1.finalPrice, option2.finalPrice);
    
    if (maxPrice === 0) return null;
    
    const percentage = ((difference / maxPrice) * 100).toFixed(1);
    
    return {
      amount: difference,
      percentage: parseFloat(percentage),
      cheaperOption: option1.finalPrice < option2.finalPrice ? option1 : option2,
      expensiveOption: option1.finalPrice > option2.finalPrice ? option1 : option2
    };
  }, [hotelComparisons]);

  if (hotelComparisons.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Hotel className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No hotels selected for comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparison Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5 text-blue-600" />
            {viewMode === 'agent' ? 'Hotel Comparison - Agent View' : 'Choose Your Preferred Hotel'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{hotelComparisons.length}</div>
              <p className="text-sm text-gray-600">Hotel Options</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {cheapestOption ? formatAmount(cheapestOption.finalPrice) : formatAmount(0)}
              </div>
              <p className="text-sm text-gray-600">Best Price</p>
            </div>
            {savings && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatAmount(savings.amount)}
                </div>
                <p className="text-sm text-gray-600">Potential Savings</p>
              </div>
            )}
          </div>

          {savings && viewMode === 'agent' && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-700">
                <strong>{savings.cheaperOption.hotel.name}</strong> is {savings.percentage}% cheaper 
                than <strong>{savings.expensiveOption.hotel.name}</strong>, 
                saving <strong>{formatAmount(savings.amount)}</strong> total.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hotel Options Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {hotelComparisons.map((comparison, index) => (
          <Card 
            key={comparison.hotel.id} 
            className={`border-2 transition-all hover:shadow-lg ${
              cheapestOption && comparison === cheapestOption ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Hotel className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{comparison.hotel.name}</CardTitle>
                    {cheapestOption && comparison === cheapestOption && (
                      <Badge className="bg-green-600 text-white">Best Value</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{comparison.hotel.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{comparison.hotel.destination}</span>
                    </div>
                  </div>
                </div>
                {viewMode === 'client' && onSelectHotel && (
                  <Button 
                    onClick={() => onSelectHotel(comparison.hotel.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Select Hotel
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Room Arrangements */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Room Arrangements
                </h4>
                <div className="space-y-1">
                  {comparison.roomArrangements.map((room, roomIndex) => (
                    <div key={roomIndex} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span>{room.num_rooms}x {room.room_type}</span>
                        {viewMode === 'agent' && (
                          <span className="font-medium">{formatAmount(room.total || 0)}</span>
                        )}
                      </div>
                      <div className="text-gray-600">
                        {room.adults} Adults, {(room.children_with_bed || 0) + (room.children_no_bed || 0)} Children
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Services */}
              {(comparison.transfers.length > 0 || comparison.activities.length > 0) && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Additional Services</h4>
                  <div className="space-y-1 text-sm">
                    {comparison.transfers.map((transfer, idx) => (
                      <div key={idx} className="flex justify-between bg-blue-50 p-2 rounded">
                        <span>{transfer.type} ({transfer.from} → {transfer.to})</span>
                        {viewMode === 'agent' && (
                          <span>{formatAmount(transfer.total || 0)}</span>
                        )}
                      </div>
                    ))}
                    {comparison.activities.map((activity, idx) => (
                      <div key={idx} className="flex justify-between bg-purple-50 p-2 rounded">
                        <span>{activity.name}</span>
                        {viewMode === 'agent' && (
                          <span>{formatAmount(activity.total_cost || 0)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  {viewMode === 'agent' ? (
                    // Agent View - Show breakdown
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Base Price:</span>
                        <span>{formatAmount(comparison.basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>Markup ({markupPercentage}%):</span>
                        <span>+{formatAmount(comparison.markupAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Client Price:</span>
                        <span className="text-green-600">{formatAmount(comparison.finalPrice)}</span>
                      </div>
                    </>
                  ) : (
                    // Client View - Show only final price
                    <div className="flex justify-between font-semibold text-xl">
                      <span>Total Price:</span>
                      <span className="text-green-600">{formatAmount(comparison.finalPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Per Person:</span>
                    <span>{formatAmount(comparison.pricePerPerson)}</span>
                  </div>
                  {viewMode === 'client' && (
                    <div className="text-xs text-gray-500 mt-2">
                      Includes: Accommodation, transfers, activities, taxes & service charges
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Duration */}
              <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{quote.duration_nights || 0} nights, {quote.duration_days || 0} days</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{(quote.adults || 0) + (quote.children_with_bed || 0) + (quote.children_no_bed || 0) + (quote.infants || 0)} travelers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Comparison Tools */}
      {viewMode === 'agent' && hotelComparisons.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Pricing Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Markup Percentage</p>
                <p className="text-2xl font-bold text-blue-600">{markupPercentage}%</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Markup Amount</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatAmount(hotelComparisons.reduce((sum, comp) => sum + comp.markupAmount, 0) / hotelComparisons.length)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average Price Difference</p>
                <p className="text-2xl font-bold text-green-600">
                  {savings ? formatAmount(savings.amount) : formatAmount(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiHotelQuoteComparison;
