
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Bed, Users, Plus, X } from "lucide-react";
import { RoomArrangement } from "../../types/quote.types";

interface AccommodationSectionProps {
  selectedHotels: any[];
  roomArrangements: RoomArrangement[];
  onRoomArrangementsChange: (arrangements: RoomArrangement[]) => void;
  availableRoomTypes: string[];
  duration: number;
}

const AccommodationSection: React.FC<AccommodationSectionProps> = ({
  selectedHotels,
  roomArrangements,
  onRoomArrangementsChange,
  availableRoomTypes,
  duration
}) => {
  const addRoomArrangement = (hotelId: string) => {
    const newArrangement: RoomArrangement = {
      id: `room-${Date.now()}`,
      hotel_id: hotelId,
      room_type: availableRoomTypes[0] || "Standard Room",
      num_rooms: 1,
      adults: 2,
      children_with_bed: 0,
      children_no_bed: 0,
      infants: 0,
      rate_per_night: {
        adult: 100,
        childWithBed: 70,
        childNoBed: 40,
        infant: 0
      },
      nights: duration,
      total: 200 * duration // 2 adults * 100 * duration
    };
    
    onRoomArrangementsChange([...roomArrangements, newArrangement]);
  };

  const updateArrangement = (id: string, updates: Partial<RoomArrangement>) => {
    const updatedArrangements = roomArrangements.map(arr => {
      if (arr.id === id) {
        const updated = { ...arr, ...updates };
        // Recalculate total
        updated.total = updated.num_rooms * (
          (updated.adults * updated.rate_per_night.adult * updated.nights) +
          (updated.children_with_bed * updated.rate_per_night.childWithBed * updated.nights) +
          (updated.children_no_bed * updated.rate_per_night.childNoBed * updated.nights) +
          (updated.infants * updated.rate_per_night.infant * updated.nights)
        );
        return updated;
      }
      return arr;
    });
    onRoomArrangementsChange(updatedArrangements);
  };

  const removeArrangement = (id: string) => {
    onRoomArrangementsChange(roomArrangements.filter(arr => arr.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bed className="h-5 w-5 text-blue-600" />
          Room Arrangements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedHotels.map(hotel => {
          const hotelArrangements = roomArrangements.filter(arr => arr.hotel_id === hotel.id);
          
          return (
            <div key={hotel.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium">{hotel.name}</h3>
                  <p className="text-sm text-gray-600">{hotel.category} • {hotel.destination}</p>
                </div>
                <Button
                  onClick={() => addRoomArrangement(hotel.id)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              </div>

              {hotelArrangements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bed className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No room arrangements added yet</p>
                  <Button
                    onClick={() => addRoomArrangement(hotel.id)}
                    size="sm"
                    className="mt-2"
                  >
                    Add First Room
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {hotelArrangements.map(arrangement => (
                    <Card key={arrangement.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-3">
                            <div>
                              <Label>Room Type</Label>
                              <Select
                                value={arrangement.room_type}
                                onValueChange={(value) => updateArrangement(arrangement.id, { room_type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableRoomTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Number of Rooms</Label>
                              <Input
                                type="number"
                                min="1"
                                value={arrangement.num_rooms}
                                onChange={(e) => updateArrangement(arrangement.id, { num_rooms: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Adults</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={arrangement.adults}
                                  onChange={(e) => updateArrangement(arrangement.id, { adults: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div>
                                <Label>Children (with bed)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={arrangement.children_with_bed}
                                  onChange={(e) => updateArrangement(arrangement.id, { children_with_bed: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Children (no bed)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={arrangement.children_no_bed}
                                  onChange={(e) => updateArrangement(arrangement.id, { children_no_bed: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div>
                                <Label>Infants</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={arrangement.infants}
                                  onChange={(e) => updateArrangement(arrangement.id, { infants: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="text-right">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Total Cost:</span>
                                <Badge variant="outline" className="text-green-600 font-medium">
                                  {formatCurrency(arrangement.total)}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500">
                                {arrangement.nights} nights × {arrangement.num_rooms} room(s)
                              </div>
                              <Button
                                onClick={() => removeArrangement(arrangement.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 mt-2"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {hotelArrangements.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Hotel Total:</span>
                    <Badge className="bg-blue-600 text-white">
                      {formatCurrency(hotelArrangements.reduce((sum, arr) => sum + arr.total, 0))}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AccommodationSection;
