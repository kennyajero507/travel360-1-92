
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Users, MapPin, Clock, CheckCircle } from 'lucide-react';
import { ClientQuotePreview as ClientQuotePreviewType } from '../../types/quote.types';

interface ClientQuotePreviewProps {
  preview: ClientQuotePreviewType;
  onHotelSelect: (hotelId: string) => void;
  selectedHotelId: string | null;
}

const ClientQuotePreview: React.FC<ClientQuotePreviewProps> = ({
  preview,
  onHotelSelect,
  selectedHotelId
}) => {
  return (
    <div className="space-y-6">
      {/* Quote Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{preview.packageName}</CardTitle>
              <p className="text-gray-600 mt-1">Quote for {preview.client}</p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {preview.inquiryNumber}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium">{preview.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Travel Dates</p>
                <p className="font-medium">
                  {new Date(preview.startDate).toLocaleDateString()} - {new Date(preview.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{preview.duration.days} days, {preview.duration.nights} nights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Travelers</p>
                <p className="font-medium">
                  {preview.travelers.adults} adults
                  {preview.travelers.childrenWithBed > 0 && `, ${preview.travelers.childrenWithBed} children`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Options */}
      {preview.hotelOptions && preview.hotelOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hotel Options</CardTitle>
            <p className="text-gray-600">Please select your preferred accommodation</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {preview.hotelOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedHotelId === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onHotelSelect(option.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{option.name}</h3>
                        <Badge variant="outline">{option.category}</Badge>
                        {selectedHotelId === option.id && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p className="font-medium text-lg text-gray-900">
                          {option.currencyCode} {option.totalPrice.toLocaleString()}
                        </p>
                        <p>Total for {preview.duration.nights} nights</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Cost */}
      <Card>
        <CardHeader>
          <CardTitle>Total Investment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {preview.currency} {preview.totalCost.toLocaleString()}
            </p>
            <p className="text-gray-600 mt-1">
              Total cost for {preview.travelers.adults} adult{preview.travelers.adults > 1 ? 's' : ''}
              {preview.travelers.childrenWithBed > 0 && ` and ${preview.travelers.childrenWithBed} child${preview.travelers.childrenWithBed > 1 ? 'ren' : ''}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientQuotePreview;
