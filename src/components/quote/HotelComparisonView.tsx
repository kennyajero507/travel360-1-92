
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Hotel, Star, Users, Bed, DollarSign } from "lucide-react";
import { QuoteData, RoomArrangement } from "../../types/quote.types";
import { MarkupCalculation } from "../../services/markupService";

interface HotelOption {
  hotel: any;
  roomArrangements: RoomArrangement[];
  markupCalculation: MarkupCalculation;
  totalBasePrice: number;
}

interface HotelComparisonViewProps {
  quote: QuoteData;
  hotelOptions: HotelOption[];
  selectedHotels: any[];
  onSelectHotel?: (hotelId: string) => void;
  viewMode: 'agent' | 'client';
}

const HotelComparisonView: React.FC<HotelComparisonViewProps> = ({
  quote,
  hotelOptions,
  selectedHotels,
  onSelectHotel,
  viewMode = 'agent'
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

  const calculatePricePerPerson = (totalPrice: number) => {
    const travelers = getTotalTravelers();
    return travelers > 0 ? totalPrice / travelers : totalPrice;
  };

  if (hotelOptions.length === 0) {
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
      <div className="text-center">
        <h3 className="text-xl font-semibold">
          {viewMode === 'agent' ? 'Hotel Comparison - Agent View' : 'Choose Your Hotel'}
        </h3>
        <p className="text-gray-600 mt-2">
          Comparing {hotelOptions.length} hotel option{hotelOptions.length > 1 ? 's' : ''} for {getTotalTravelers()} travelers
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {hotelOptions.map((option, index) => (
          <Card key={option.hotel.id} className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-blue-600" />
                    {option.hotel.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{option.hotel.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{option.hotel.destination}</span>
                    </div>
                  </div>
                </div>
                {viewMode === 'client' && onSelectHotel && (
                  <Button 
                    onClick={() => onSelectHotel(option.hotel.id)}
                    className="bg-green-600 hover:bg-green-700"
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
                  Room Arrangements
                </h4>
                <div className="space-y-2">
                  {option.roomArrangements.map((room, roomIndex) => (
                    <div key={roomIndex} className="bg-gray-50 p-3 rounded text-sm">
                      <div className="flex justify-between items-center">
                        <span>{room.num_rooms}x {room.room_type}</span>
                        {viewMode === 'agent' && (
                          <span className="font-medium">{formatCurrency(room.total)}</span>
                        )}
                      </div>
                      <div className="text-gray-600 mt-1">
                        <Users className="h-3 w-3 inline mr-1" />
                        {room.adults} Adults, {room.children_with_bed + room.children_no_bed} Children, {room.infants} Infants
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  {viewMode === 'agent' ? (
                    // Agent View - Show full breakdown
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Base Price:</span>
                        <span>{formatCurrency(option.totalBasePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>Markup ({option.markupCalculation.markupPercentage}%):</span>
                        <span>+{formatCurrency(option.markupCalculation.markupAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total Price:</span>
                        <span className="text-green-600">{formatCurrency(option.markupCalculation.finalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Per Person:</span>
                        <span>{formatCurrency(calculatePricePerPerson(option.markupCalculation.finalPrice))}</span>
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
                        Includes: Accommodation, taxes, and service charges
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HotelComparisonView;
