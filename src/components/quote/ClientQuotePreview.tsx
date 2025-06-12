
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Calendar, Users, MapPin, Hotel, DollarSign } from 'lucide-react';
import { ClientQuotePreview, HotelOption } from '../../types/quote.types';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ClientQuotePreviewProps {
  quote: ClientQuotePreview;
  onChoosePackage: (hotelId: string) => void;
  onRequestChanges: () => void;
}

const ClientQuotePreviewComponent: React.FC<ClientQuotePreviewProps> = ({
  quote,
  onChoosePackage,
  onRequestChanges
}) => {
  const { formatAmount } = useCurrency();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{quote.packageName}</CardTitle>
              <p className="text-gray-600 mt-1">
                Travel Quote for {quote.client}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {formatAmount(quote.totalCost)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium">{quote.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{quote.duration.days} Days, {quote.duration.nights} Nights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Travelers</p>
                <p className="font-medium">
                  {quote.travelers.adults} Adults
                  {quote.travelers.childrenWithBed > 0 && `, ${quote.travelers.childrenWithBed} Children`}
                  {quote.travelers.infants > 0 && `, ${quote.travelers.infants} Infants`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Travel Dates</p>
                <p className="font-medium">
                  {new Date(quote.startDate).toLocaleDateString()} - {new Date(quote.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Hotel Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quote.hotelOptions.map((hotel) => (
              <div
                key={hotel.id}
                className={`p-4 border rounded-lg ${
                  hotel.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{hotel.name}</h3>
                      <Badge variant="outline">{hotel.category}</Badge>
                      {hotel.selected && <Badge>Selected</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Price per night:</span>
                        <span className="ml-2 font-medium">{formatAmount(hotel.pricePerNight)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total accommodation:</span>
                        <span className="ml-2 font-medium">{formatAmount(hotel.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button
                      onClick={() => onChoosePackage(hotel.id)}
                      variant={hotel.selected ? "default" : "outline"}
                      className="ml-4"
                    >
                      {hotel.selected ? 'Selected' : 'Choose This Option'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Accommodation</span>
              <span>{formatAmount(quote.hotelOptions.find(h => h.selected)?.totalPrice || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transport & Activities</span>
              <span>{formatAmount(quote.totalCost - (quote.hotelOptions.find(h => h.selected)?.totalPrice || 0))}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Package Price</span>
              <span className="text-blue-600">{formatAmount(quote.totalCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button
          onClick={onRequestChanges}
          variant="outline"
          size="lg"
        >
          Request Changes
        </Button>
        <Button
          onClick={() => {
            const selectedHotel = quote.hotelOptions.find(h => h.selected);
            if (selectedHotel) {
              onChoosePackage(selectedHotel.id);
            }
          }}
          size="lg"
          disabled={!quote.hotelOptions.some(h => h.selected)}
        >
          Confirm Booking
        </Button>
      </div>
    </div>
  );
};

export default ClientQuotePreviewComponent;
