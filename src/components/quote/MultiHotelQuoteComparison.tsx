
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Hotel, Star, Users, Bed, DollarSign, Building2 } from "lucide-react";
import { QuoteData, RoomArrangement } from "../../types/quote.types";
import { markupService, MarkupCalculation } from "../../services/markupService";

interface HotelQuoteOption {
  hotel: any;
  roomArrangements: RoomArrangement[];
  transfers: any[];
  activities: any[];
  basePrice: number;
  markupCalculation: MarkupCalculation;
  totalTravelers: number;
}

interface MultiHotelQuoteComparisonProps {
  quote: QuoteData;
  hotels: any[];
  onSelectHotel?: (hotelId: string) => void;
  viewMode: 'agent' | 'client';
  markupPercentage?: number;
}

const MultiHotelQuoteComparison: React.FC<MultiHotelQuoteComparisonProps> = ({
  quote,
  hotels,
  onSelectHotel,
  viewMode = 'agent',
  markupPercentage = 25
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.currency_code || 'USD'
    }).format(amount);
  };

  const getTotalTravelers = () => {
    return quote.adults + quote.children_with_bed + quote.children_no_bed + quote.infants;
  };

  // Group data by hotel and calculate costs
  const hotelOptions: HotelQuoteOption[] = hotels.map(hotel => {
    // Get room arrangements for this hotel
    const hotelRoomArrangements = quote.room_arrangements?.filter(arr => arr.hotel_id === hotel.id) || [];
    
    // Get transfers for this hotel
    const hotelTransfers = quote.transfers?.filter(transfer => transfer.hotel_id === hotel.id) || [];
    
    // Get activities for this hotel
    const hotelActivities = quote.activities?.filter(activity => activity.hotel_id === hotel.id) || [];
    
    // Calculate base costs
    const accommodationCost = hotelRoomArrangements.reduce((sum, arr) => sum + (arr.total || 0), 0);
    const transfersCost = hotelTransfers.reduce((sum, transfer) => sum + (transfer.total || 0), 0);
    const activitiesCost = hotelActivities.reduce((sum, activity) => sum + (activity.total_cost || 0), 0);
    
    const basePrice = accommodationCost + transfersCost + activitiesCost;
    
    // Calculate markup
    const markupCalculation = markupService.calculateWithMarkup(basePrice, markupPercentage);
    
    return {
      hotel,
      roomArrangements: hotelRoomArrangements,
      transfers: hotelTransfers,
      activities: hotelActivities,
      basePrice,
      markupCalculation,
      totalTravelers: getTotalTravelers()
    };
  }).filter(option => option.basePrice > 0); // Only show hotels with actual bookings

  const calculatePricePerPerson = (totalPrice: number) => {
    const travelers = getTotalTravelers();
    return travelers > 0 ? totalPrice / travelers : totalPrice;
  };

  if (hotelOptions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels with Bookings</h3>
          <p className="text-gray-500">Add room arrangements to hotels to see comparison options</p>
        </CardContent>
      </Card>
    );
  }

  // Find the cheapest option for comparison
  const cheapestOption = hotelOptions.reduce((min, option) => 
    option.markupCalculation.finalPrice < min.markupCalculation.finalPrice ? option : min
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">
          {viewMode === 'agent' ? 'Hotel Quote Comparison - Agent View' : 'Choose Your Preferred Hotel'}
        </h3>
        <p className="text-gray-600 mt-2">
          Comparing {hotelOptions.length} hotel option{hotelOptions.length > 1 ? 's' : ''} for {getTotalTravelers()} travelers
        </p>
        {viewMode === 'agent' && (
          <Badge variant="outline" className="mt-2">
            Markup: {markupPercentage}%
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {hotelOptions.map((option, index) => {
          const isRecommended = option === cheapestOption && hotelOptions.length > 1;
          const savings = option !== cheapestOption ? 
            cheapestOption.markupCalculation.finalPrice - option.markupCalculation.finalPrice : 0;

          return (
            <Card 
              key={option.hotel.id} 
              className={`border-2 hover:shadow-lg transition-all ${
                isRecommended ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="h-5 w-5 text-blue-600" />
                      {option.hotel.name}
                      {isRecommended && (
                        <Badge className="bg-green-600 text-white">Best Value</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{option.hotel.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{option.hotel.destination}</span>
                      </div>
                    </div>
                    {savings > 0 && viewMode === 'client' && (
                      <div className="mt-2">
                        <Badge variant="destructive" className="text-xs">
                          +{formatCurrency(savings)} vs Best Value
                        </Badge>
                      </div>
                    )}
                  </div>
                  {viewMode === 'client' && onSelectHotel && (
                    <Button 
                      onClick={() => onSelectHotel(option.hotel.id)}
                      className={isRecommended ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                    >
                      Select Hotel
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Room Arrangements Summary */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Bed className="h-4 w-4" />
                    Room Arrangements ({option.roomArrangements.length})
                  </h4>
                  <div className="space-y-2">
                    {option.roomArrangements.map((room, roomIndex) => (
                      <div key={roomIndex} className="bg-gray-50 p-3 rounded text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{room.num_rooms}x {room.room_type}</span>
                          {viewMode === 'agent' && (
                            <span className="font-medium">{formatCurrency(room.total)}</span>
                          )}
                        </div>
                        <div className="text-gray-600 mt-1 flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{room.adults} Adults</span>
                          </div>
                          {(room.children_with_bed + room.children_no_bed) > 0 && (
                            <span>{room.children_with_bed + room.children_no_bed} Children</span>
                          )}
                          {room.infants > 0 && (
                            <span>{room.infants} Infants</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {quote.duration_nights} nights @ {formatCurrency(
                            room.total / (room.num_rooms * quote.duration_nights)
                          )}/room/night
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Services */}
                {(option.transfers.length > 0 || option.activities.length > 0) && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Additional Services</h4>
                    <div className="space-y-1 text-sm">
                      {option.transfers.length > 0 && (
                        <div className="flex justify-between">
                          <span>Transfers ({option.transfers.length})</span>
                          {viewMode === 'agent' && (
                            <span>{formatCurrency(option.transfers.reduce((sum, t) => sum + t.total, 0))}</span>
                          )}
                        </div>
                      )}
                      {option.activities.length > 0 && (
                        <div className="flex justify-between">
                          <span>Activities ({option.activities.length})</span>
                          {viewMode === 'agent' && (
                            <span>{formatCurrency(option.activities.reduce((sum, a) => sum + a.total_cost, 0))}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    {viewMode === 'agent' ? (
                      // Agent View - Show full breakdown
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Base Price:</span>
                          <span>{formatCurrency(option.basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-orange-600">
                          <span>Markup ({option.markupCalculation.markupPercentage}%):</span>
                          <span>+{formatCurrency(option.markupCalculation.markupAmount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Client Price:</span>
                          <span className="text-green-600">{formatCurrency(option.markupCalculation.finalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Per Person:</span>
                          <span>{formatCurrency(calculatePricePerPerson(option.markupCalculation.finalPrice))}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Profit Margin:</span>
                          <span>{markupService.calculateMarginFromMarkup(markupPercentage).toFixed(1)}%</span>
                        </div>
                      </>
                    ) : (
                      // Client View - Show only final price
                      <>
                        <div className="flex justify-between font-semibold text-xl">
                          <span>Total Price:</span>
                          <span className="text-green-600">{formatCurrency(option.markupCalculation.finalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Per Person:</span>
                          <span>{formatCurrency(calculatePricePerPerson(option.markupCalculation.finalPrice))}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          Includes: Accommodation, transfers, activities, taxes & service charges
                        </div>
                        <div className="text-xs text-gray-400">
                          {quote.duration_nights} nights • {quote.destination}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MultiHotelQuoteComparison;
