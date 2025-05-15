
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { BedDouble, Plus } from "lucide-react";

interface HotelRoomListProps {
  roomTypes: any[];
  selectedHotel: any;
  onAddRoom: (roomType: any) => void;
}

const HotelRoomList = ({ roomTypes, selectedHotel, onAddRoom }: HotelRoomListProps) => {
  if (!selectedHotel) {
    return null;
  }

  if (!roomTypes || roomTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No room types available for this hotel. Please add room types in the hotel management section.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Room Types at {selectedHotel.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roomTypes.map((roomType) => (
            <div key={roomType.id} className="border rounded-md p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">{roomType.name}</h3>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <p>Max Occupancy: {roomType.maxOccupancy} persons</p>
                  <p>Bed Options: {roomType.bedOptions}</p>
                  <p>Rate per Night: ${roomType.ratePerNight}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAddRoom(roomType)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelRoomList;
