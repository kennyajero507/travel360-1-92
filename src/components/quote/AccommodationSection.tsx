
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Plus, X, Hotel, Edit } from "lucide-react";
import { RoomArrangement } from "../../types/quote.types";
import MarkupCalculator from "./MarkupCalculator";

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
      total: 0
    };
    
    // Calculate total
    newArrangement.total = calculateRoomTotal(newArrangement);
    
    onRoomArrangementsChange([...roomArrangements, newArrangement]);
  };

  const updateRoomArrangement = (id: string, updates: Partial<RoomArrangement>) => {
    const updated = roomArrangements.map(arr => {
      if (arr.id === id) {
        const updatedArr = { ...arr, ...updates };
        updatedArr.total = calculateRoomTotal(updatedArr);
        return updatedArr;
      }
      return arr;
    });
    onRoomArrangementsChange(updated);
  };

  const removeRoomArrangement = (id: string) => {
    onRoomArrangementsChange(roomArrangements.filter(arr => arr.id !== id));
  };

  const calculateRoomTotal = (room: RoomArrangement) => {
    if (!room.rate_per_night || !room.nights) return 0;
    
    return room.num_rooms * (
      (room.adults * room.rate_per_night.adult * room.nights) +
      (room.children_with_bed * room.rate_per_night.childWithBed * room.nights) +
      (room.children_no_bed * room.rate_per_night.childNoBed * room.nights) +
      (room.infants * room.rate_per_night.infant * room.nights)
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Hotel className="h-5 w-5 text-blue-600" />
        <CardTitle>Accommodation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedHotels.map(hotel => (
          <div key={hotel.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-lg">{hotel.name}</h4>
                <p className="text-sm text-gray-500">{hotel.category} • {hotel.destination}</p>
              </div>
              <Button
                onClick={() => addRoomArrangement(hotel.id)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Room
              </Button>
            </div>

            {/* Room Arrangements Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Type</TableHead>
                    <TableHead className="text-center">No. Rooms</TableHead>
                    <TableHead className="text-center">No. Adults</TableHead>
                    <TableHead className="text-center">No. CWB</TableHead>
                    <TableHead className="text-center">No. CNB</TableHead>
                    <TableHead className="text-center">No. Infants</TableHead>
                    <TableHead className="text-right">Adult Cost</TableHead>
                    <TableHead className="text-right">CWB Cost</TableHead>
                    <TableHead className="text-right">CNB Cost</TableHead>
                    <TableHead className="text-right">Infant Cost</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomArrangements
                    .filter(arr => arr.hotel_id === hotel.id)
                    .map((arrangement) => (
                      <TableRow key={arrangement.id}>
                        <TableCell>
                          <Select
                            value={arrangement.room_type}
                            onValueChange={(value) => updateRoomArrangement(arrangement.id, { room_type: value })}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoomTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={arrangement.num_rooms}
                            onChange={(e) => updateRoomArrangement(arrangement.id, { num_rooms: parseInt(e.target.value) || 1 })}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={arrangement.adults}
                            onChange={(e) => updateRoomArrangement(arrangement.id, { adults: parseInt(e.target.value) || 0 })}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={arrangement.children_with_bed}
                            onChange={(e) => updateRoomArrangement(arrangement.id, { children_with_bed: parseInt(e.target.value) || 0 })}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={arrangement.children_no_bed}
                            onChange={(e) => updateRoomArrangement(arrangement.id, { children_no_bed: parseInt(e.target.value) || 0 })}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={arrangement.infants}
                            onChange={(e) => updateRoomArrangement(arrangement.id, { infants: parseInt(e.target.value) || 0 })}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={arrangement.rate_per_night?.adult || 0}
                            onChange={(e) => updateRoomArrangement(arrangement.id, { 
                              rate_per_night: { 
                                ...arrangement.rate_per_night!, 
                                adult: parseFloat(e.target.value) || 0 
                              } 
                            })}
                            className="w-24 text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={arrangement.rate_per_night?.childWithBed || 0}
                            onChange={(e) => updateRoomArrangement(arrangement.id, { 
                              rate_per_night: { 
                                ...arrangement.rate_per_night!, 
                                childWithBed: parseFloat(e.target.value) || 0 
                              } 
                            })}
                            className="w-24 text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={arrangement.rate_per_night?.childNoBed || 0}
                            onChange={(e) => updateRoomArrangement(arrangement.id, { 
                              rate_per_night: { 
                                ...arrangement.rate_per_night!, 
                                childNoBed: parseFloat(e.target.value) || 0 
                              } 
                            })}
                            className="w-24 text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={arrangement.rate_per_night?.infant || 0}
                            onChange={(e) => updateRoomArrangement(arrangement.id, { 
                              rate_per_night: { 
                                ...arrangement.rate_per_night!, 
                                infant: parseFloat(e.target.value) || 0 
                              } 
                            })}
                            className="w-24 text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoomArrangement(arrangement.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {roomArrangements.filter(arr => arr.hotel_id === hotel.id).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-6 text-gray-500">
                        No room arrangements added yet. Click "Add Room" to start.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Hotel Total */}
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-gray-600">Hotel Total:</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(roomArrangements
                    .filter(arr => arr.hotel_id === hotel.id)
                    .reduce((sum, arr) => sum + arr.total, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}

        {selectedHotels.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hotels selected yet</p>
            <p className="text-sm text-gray-400">Select hotels in the hotel selection step first</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccommodationSection;
