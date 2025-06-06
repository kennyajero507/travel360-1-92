
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Hotel } from "../../types/hotel.types";
import { QuoteData } from "../../types/quote.types";

interface QuoteSummaryProps {
  quote: QuoteData;
  selectedHotels?: Hotel[];
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({ 
  quote, 
  selectedHotels = [] 
}) => {
  // Calculate traveler totals from quote data
  const travelers = {
    adults: quote.adults,
    childrenWithBed: quote.children_with_bed,
    childrenNoBed: quote.children_no_bed,
    infants: quote.infants
  };

  // Calculate total cost from room arrangements
  const calculateTotalCost = () => {
    const roomTotal = quote.room_arrangements.reduce((sum, room) => sum + room.total, 0);
    const activitiesTotal = quote.activities.reduce((sum, activity) => sum + activity.cost, 0);
    const transfersTotal = quote.transfers.reduce((sum, transfer) => sum + transfer.cost, 0);
    const transportsTotal = quote.transports.reduce((sum, transport) => sum + transport.cost, 0);
    
    const subtotal = roomTotal + activitiesTotal + transfersTotal + transportsTotal;
    
    // Apply markup
    let markup = 0;
    if (quote.markup_type === 'percentage') {
      markup = subtotal * (quote.markup_value / 100);
    } else if (quote.markup_type === 'fixed') {
      markup = quote.markup_value;
    }
    
    return subtotal + markup;
  };

  const totalCost = calculateTotalCost();
  
  // Calculate per person cost
  const totalTravelers = travelers.adults + travelers.childrenWithBed + travelers.childrenNoBed;
  const costPerPerson = totalTravelers > 0 ? totalCost / totalTravelers : 0;

  // Calculate accommodation summary
  const accommodationSummary = () => {
    const summary = quote.room_arrangements.reduce((acc, room) => {
      const roomCost = room.total;
      const totalGuests = room.adults + room.children + room.infants;
      
      acc.totalRooms += room.numRooms;
      acc.totalNights += room.nights;
      acc.totalCost += roomCost;
      acc.totalGuests += totalGuests;
      
      return acc;
    }, {
      totalRooms: 0,
      totalNights: 0,
      totalCost: 0,
      totalGuests: 0
    });

    return summary;
  };

  const accommodation = accommodationSummary();

  return (
    <div className="space-y-6">
      {/* Quote Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
          <CardDescription>
            {quote.destination} • {quote.duration_days} days, {quote.duration_nights} nights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Client</p>
              <p className="text-lg">{quote.client}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mobile</p>
              <p className="text-lg">{quote.mobile}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tour Type</p>
              <p className="text-lg capitalize">{quote.tour_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-lg capitalize">{quote.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travelers Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Travelers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{travelers.adults}</p>
              <p className="text-sm text-gray-500">Adults</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{travelers.childrenWithBed}</p>
              <p className="text-sm text-gray-500">Children with Bed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{travelers.childrenNoBed}</p>
              <p className="text-sm text-gray-500">Children no Bed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{travelers.infants}</p>
              <p className="text-sm text-gray-500">Infants</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accommodation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Accommodation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Rooms</p>
              <p className="text-lg">{accommodation.totalRooms}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Nights</p>
              <p className="text-lg">{accommodation.totalNights}</p>
            </div>
          </div>
          
          {quote.room_arrangements.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Room Arrangements</p>
              <div className="space-y-2">
                {quote.room_arrangements.map((room, index) => (
                  <div key={room.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">
                      {room.numRooms}× {room.roomType} ({room.adults}A, {room.children}C, {room.infants}I) × {room.nights}N
                    </span>
                    <span className="font-medium">${room.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities Summary */}
      {quote.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quote.activities.map((activity, index) => (
                <div key={activity.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <span className="font-medium">${activity.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Accommodation</span>
              <span>${accommodation.totalCost.toFixed(2)}</span>
            </div>
            {quote.activities.length > 0 && (
              <div className="flex justify-between">
                <span>Activities</span>
                <span>${quote.activities.reduce((sum, a) => sum + a.cost, 0).toFixed(2)}</span>
              </div>
            )}
            {quote.transfers.length > 0 && (
              <div className="flex justify-between">
                <span>Transfers</span>
                <span>${quote.transfers.reduce((sum, t) => sum + t.cost, 0).toFixed(2)}</span>
              </div>
            )}
            {quote.transports.length > 0 && (
              <div className="flex justify-between">
                <span>Transport</span>
                <span>${quote.transports.reduce((sum, t) => sum + t.cost, 0).toFixed(2)}</span>
              </div>
            )}
            
            <hr className="my-2" />
            
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(totalCost - (quote.markup_type === 'percentage' ? totalCost * (quote.markup_value / 100) : quote.markup_value)).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Markup ({quote.markup_type === 'percentage' ? `${quote.markup_value}%` : 'Fixed'})</span>
              <span>${(quote.markup_type === 'percentage' ? totalCost * (quote.markup_value / 100) : quote.markup_value).toFixed(2)}</span>
            </div>
            
            <hr className="my-2" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total Cost</span>
              <span>${totalCost.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>Cost per Person</span>
              <span>${costPerPerson.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{quote.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuoteSummary;
