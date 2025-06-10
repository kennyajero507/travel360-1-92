
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Calendar, Users, MapPin, Hotel, DollarSign } from "lucide-react";
import { QuoteData } from "../../types/quote.types";

interface QuoteSummaryProps {
  quote: QuoteData;
  hotels?: any[];
  hotelOptions?: any[];
  showMultipleOptions?: boolean;
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({ 
  quote, 
  hotels = [], 
  hotelOptions = [],
  showMultipleOptions = false 
}) => {
  const calculateSubtotal = () => {
    const roomTotal = quote.room_arrangements?.reduce((sum, room) => sum + (room.total || 0), 0) || 0;
    const activitiesTotal = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;
    const transportTotal = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
    const transfersTotal = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
    
    return roomTotal + activitiesTotal + transportTotal + transfersTotal;
  };

  const calculateMarkup = () => {
    const subtotal = calculateSubtotal();
    const markupType = quote.markup_type || "percentage";
    const markupValue = quote.markup_value || 0;
    
    if (markupType === "percentage") {
      return (subtotal * markupValue) / 100;
    } else {
      return markupValue;
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateMarkup();
  };

  return (
    <div className="space-y-6">
      {/* Quote Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Quote Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700">Client</h4>
              <p className="text-lg">{quote.client}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Status</h4>
              <Badge variant={quote.status === 'approved' ? 'default' : 'secondary'}>
                {quote.status}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-700">Destination</h4>
                <p>{quote.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-700">Travel Dates</h4>
                <p>{new Date(quote.start_date).toLocaleDateString()} - {new Date(quote.end_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-700">Travelers</h4>
                <p>{quote.adults + quote.children_with_bed + quote.children_no_bed} people</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multiple Hotel Options */}
      {showMultipleOptions && hotelOptions && hotelOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              Hotel Options ({hotelOptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hotelOptions.map((option, index) => (
                <div key={option.id} className={`p-4 border rounded-lg ${option.is_selected ? 'border-green-500 bg-green-50' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Option {index + 1}: {option.option_name}</h4>
                      <p className="text-sm text-gray-600">{option.hotel?.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">${option.total_price?.toFixed(2)}</p>
                      {option.is_selected && <Badge className="mt-1">Selected</Badge>}
                    </div>
                  </div>
                  {option.room_arrangements && option.room_arrangements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Rooms:</p>
                      <div className="text-sm text-gray-600">
                        {option.room_arrangements.map((room: any, idx: number) => (
                          <span key={idx}>
                            {room.num_rooms} × {room.room_type}
                            {idx < option.room_arrangements.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Hotel Accommodation (legacy) */}
      {!showMultipleOptions && quote.room_arrangements && quote.room_arrangements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              Accommodation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quote.room_arrangements.map((room, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{room.room_type}</h4>
                    <p className="text-sm text-gray-600">
                      {room.num_rooms} room(s) × {room.nights} nights
                      ({room.adults} adults
                      {room.children_with_bed > 0 && `, ${room.children_with_bed} CWB`}
                      {room.children_no_bed > 0 && `, ${room.children_no_bed} CNB`}
                      {room.infants > 0 && `, ${room.infants} infants`})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${room.total?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities */}
      {quote.activities && quote.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quote.activities.map((activity, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{activity.name}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${activity.total_cost?.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{activity.num_people} people</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Price Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Markup ({quote.markup_type === 'percentage' ? `${quote.markup_value}%` : 'Fixed'})</span>
            <span>${calculateMarkup().toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-teal-600">${calculateTotal().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Per Person</span>
            <span>${(calculateTotal() / Math.max(1, quote.adults + quote.children_with_bed + quote.children_no_bed)).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteSummary;
