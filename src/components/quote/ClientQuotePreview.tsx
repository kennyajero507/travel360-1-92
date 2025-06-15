
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
  approvedHotelId?: string;
  approving?: boolean;
}

const ClientQuotePreviewComponent: React.FC<ClientQuotePreviewProps> = ({
  quote,
  onChoosePackage,
  onRequestChanges,
  approvedHotelId,
  approving
}) => {
  const { formatAmount } = useCurrency();

  // If approved, figure out which hotel id is selected
  const isApproved = !!approvedHotelId;
  const approvedHotel = approvedHotelId
    ? quote.hotelOptions.find(h => h.id === approvedHotelId)
    : null;

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
          {isApproved && approvedHotel && (
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-green-500 text-white">Approved</Badge>
              <span className="text-sm text-gray-600">
                Package selected: <b>{approvedHotel.name}</b>
              </span>
            </div>
          )}
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
                <p className="font-medium">{quote.travelers.adults} Adults, {quote.travelers.childrenWithBed} CWB, {quote.travelers.childrenNoBed} CNB, {quote.travelers.infants} Infants</p>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          {/* Hotel Options / Package Selection */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Hotel Options</h3>
            <div className="grid grid-cols-1 gap-4">
              {quote.hotelOptions.map((option) => (
                <Card key={option.id} className={option.id === approvedHotelId ? "border-green-500 shadow-green-200/60" : ""}>
                  <CardContent className="flex flex-col md:flex-row justify-between items-center py-3 gap-2">
                    <div className="flex flex-col items-start w-full md:w-auto">
                      <div className="flex items-center gap-2">
                        <Hotel size={22} className="text-blue-500" />
                        <span className="font-medium">{option.name}</span>
                        <Badge variant="outline">{option.category}</Badge>
                        {option.id === approvedHotelId && (
                          <Badge className="ml-2 bg-green-500 text-white">Approved</Badge>
                        )}
                      </div>
                      <div className="mt-1 text-muted-foreground text-sm">
                        Price per night: {formatAmount(option.pricePerNight)}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Total: <b>{formatAmount(option.totalPrice)}</b>
                      </div>
                    </div>
                    <div>
                      {isApproved ? (
                        // Already approved, show status/confirmation
                        option.id === approvedHotelId && (
                          <div className="text-green-600 font-semibold flex items-center gap-1">
                            <DollarSign size={18} className="inline-block" />
                            Approved!
                          </div>
                        )
                      ) : (
                        <Button
                          variant="default"
                          disabled={approving}
                          onClick={() => onChoosePackage(option.id)}
                        >
                          {approving ? "Approving..." : "Approve this Package"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Separator className="my-4" />
          {/* Change request */}
          <div className="text-center mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onRequestChanges}
              disabled={approving}
            >
              Request Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientQuotePreviewComponent;
