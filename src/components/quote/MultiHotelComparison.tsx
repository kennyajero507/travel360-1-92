
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Hotel, Users, Bed, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useCurrency } from "../../contexts/CurrencyContext";
import { ReverseMarkupCalculator, HotelComparisonData } from "../../utils/reverseMarkupCalculator";

interface MultiHotelComparisonProps {
  hotel1Data: HotelComparisonData;
  hotel2Data: HotelComparisonData;
  viewMode: 'agent' | 'client';
  onSelectHotel?: (hotelId: string) => void;
  showComparison?: boolean;
}

const MultiHotelComparison: React.FC<MultiHotelComparisonProps> = ({
  hotel1Data,
  hotel2Data,
  viewMode = 'agent',
  onSelectHotel,
  showComparison = true
}) => {
  const { formatAmount } = useCurrency();

  const comparison = ReverseMarkupCalculator.compareHotels(hotel1Data, hotel2Data);

  const renderHotelCard = (hotelData: HotelComparisonData, isRecommended: boolean = false) => (
    <Card className={`relative ${isRecommended ? 'ring-2 ring-green-500' : ''}`}>
      {isRecommended && (
        <div className="absolute -top-3 left-4 z-10">
          <Badge className="bg-green-500 text-white">Best Value</Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-blue-600" />
              {hotelData.hotel.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{hotelData.hotel.category}</Badge>
              <span className="text-sm text-gray-600">{hotelData.hotel.destination}</span>
            </div>
          </div>
          {viewMode === 'client' && onSelectHotel && (
            <Button 
              onClick={() => onSelectHotel(hotelData.hotel.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Select Hotel
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Room Arrangements */}
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Bed className="h-4 w-4" />
            Room Arrangements
          </h4>
          <div className="space-y-2">
            {hotelData.roomArrangements.map((room, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span>{room.num_rooms}x {room.room_type}</span>
                  {viewMode === 'agent' && (
                    <span className="font-medium">{formatAmount(room.total)}</span>
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

        {/* Transfers & Activities Summary */}
        {viewMode === 'agent' && (hotelData.transfers.length > 0 || hotelData.activities.length > 0) && (
          <div className="text-sm space-y-1">
            {hotelData.transfers.length > 0 && (
              <div className="flex justify-between">
                <span>Transfers ({hotelData.transfers.length})</span>
                <span>{formatAmount(hotelData.transfers.reduce((sum, t) => sum + (t.total || 0), 0))}</span>
              </div>
            )}
            {hotelData.activities.length > 0 && (
              <div className="flex justify-between">
                <span>Activities ({hotelData.activities.length})</span>
                <span>{formatAmount(hotelData.activities.reduce((sum, a) => sum + (a.total_cost || 0), 0))}</span>
              </div>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="border-t pt-4">
          {viewMode === 'agent' ? (
            // Agent View - Full Breakdown
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Price:</span>
                <span>{formatAmount(hotelData.basePrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-orange-600">
                <span>Markup ({hotelData.markupCalculation.markupPercentage}%):</span>
                <span>+{formatAmount(hotelData.markupCalculation.markupAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total Price:</span>
                <span className="text-green-600">{formatAmount(hotelData.finalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Per Person:</span>
                <span>{formatAmount(hotelData.perPersonCost)}</span>
              </div>
            </div>
          ) : (
            // Client View - Clean Price Only
            <div className="space-y-2">
              <div className="flex justify-between font-semibold text-xl">
                <span>Total Price:</span>
                <span className="text-green-600">{formatAmount(hotelData.finalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Per Person:</span>
                <span>{formatAmount(hotelData.perPersonCost)}</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Includes: Accommodation, transfers, activities, taxes & service charges
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const cheaperHotelId = comparison.cheaperHotel.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold">
          {viewMode === 'agent' ? 'Hotel Comparison - Agent View' : 'Choose Your Preferred Hotel'}
        </h3>
        <p className="text-gray-600 mt-2">
          Compare 2 hotel options for your {hotel1Data.roomArrangements.reduce((sum, r) => sum + r.adults + r.children_with_bed + r.children_no_bed + r.infants, 0)} travelers
        </p>
      </div>

      {/* Price Comparison Summary */}
      {showComparison && viewMode === 'agent' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {comparison.priceDifference > 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                )}
                <span className="font-medium">Price Difference</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">{formatAmount(comparison.savings)}</div>
                <div className="text-sm text-gray-600">
                  {comparison.percentageDifference.toFixed(1)}% difference
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {comparison.cheaperHotel.name} is the more economical option
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotel Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderHotelCard(hotel1Data, hotel1Data.hotel.id === cheaperHotelId)}
        {renderHotelCard(hotel2Data, hotel2Data.hotel.id === cheaperHotelId)}
      </div>

      {/* Client View Call to Action */}
      {viewMode === 'client' && (
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <h4 className="font-medium mb-2">Ready to proceed?</h4>
            <p className="text-gray-600 mb-4">
              Select your preferred hotel option above, or contact us if you need any modifications.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline">Request Changes</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Proceed with Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiHotelComparison;
