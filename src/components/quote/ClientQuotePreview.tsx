
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, Users, MapPin, Package, Phone, Mail } from "lucide-react";
import { ClientQuotePreview, HotelOption } from "../../types/quote.types";
import { useCurrency } from "../../contexts/CurrencyContext";

interface ClientQuotePreviewProps {
  quote: ClientQuotePreview;
  onChoosePackage?: (hotelId: string) => void;
  onRequestChanges?: () => void;
}

const ClientQuotePreview = ({ quote, onChoosePackage, onRequestChanges }: ClientQuotePreviewProps) => {
  const { formatAmount } = useCurrency();

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border border-teal-100">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-teal-800">
                Your Travel Quote
              </CardTitle>
              <p className="text-teal-600 mt-1">
                {quote.inquiryNumber} • Prepared on {new Date(quote.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge 
              variant={quote.tourType === 'international' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {quote.tourType.charAt(0).toUpperCase() + quote.tourType.slice(1)} Tour
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Trip Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="font-medium">{quote.destination}</p>
                  </div>
                </div>
                {quote.packageName && (
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-sm text-gray-500">Package</p>
                      <p className="font-medium">{quote.packageName}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-500">Travel Dates</p>
                    <p className="font-medium">
                      {new Date(quote.startDate).toLocaleDateString()} - {new Date(quote.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{quote.duration.nights} nights, {quote.duration.days} days</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Traveler Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-500">Group Size</p>
                    <p className="font-medium">
                      {quote.travelers.adults} Adults
                      {quote.travelers.childrenWithBed > 0 && `, ${quote.travelers.childrenWithBed} Children`}
                      {quote.travelers.infants > 0 && `, ${quote.travelers.infants} Infants`}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guest Name</p>
                  <p className="font-medium">{quote.client}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Hotel Package Options
          </CardTitle>
          <p className="text-gray-600">
            Choose your preferred accommodation option below:
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {quote.hotelOptions.map((hotel, index) => (
            <Card key={hotel.id} className="border border-gray-200 hover:border-teal-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      Hotel Option {index + 1} – {hotel.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Complete package including accommodation and selected services
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-600">
                      {formatCurrency(hotel.totalPrice, hotel.currencyCode)}
                    </p>
                    <p className="text-sm text-gray-500">Total Package Price</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={() => onChoosePackage?.(hotel.id)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Choose This Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={onRequestChanges}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Request Changes
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call to Discuss
            </Button>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Have questions? Contact your travel consultant for assistance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientQuotePreview;
