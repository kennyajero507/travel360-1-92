import { useState, useEffect } from "react";
import type { RoomArrangement as RoomArrangementType } from "../../types/quote.types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";

interface RoomArrangementProps {
  roomArrangements: RoomArrangementType[];
  duration: number;
  onRoomArrangementsChange: (arrangements: RoomArrangementType[]) => void;
  availableRoomTypes: string[];
}

const RoomArrangement = ({ 
  roomArrangements, 
  duration, 
  onRoomArrangementsChange,
  availableRoomTypes 
}: RoomArrangementProps) => {
  // Room capacity limits for validation
  const roomCapacityLimits: Record<string, number> = {
    "Single Room": 1,
    "Double Room": 2,
    "Twin Room": 2,
    "Triple Room": 3,
    "Quad Room": 4,
    "Family Room": 6
  };

  // Update room calculations whenever relevant values change
  useEffect(() => {
    if (duration <= 0) return;
    
    const updatedArrangements = roomArrangements.map(room => {
      // Calculate total cost per room type
      const totalPerRoom = 
        (room.adults * room.ratePerNight.adult + 
         room.childrenWithBed * room.ratePerNight.childWithBed + 
         room.childrenNoBed * room.ratePerNight.childNoBed + 
         room.infants * room.ratePerNight.infant) * duration * room.numRooms;
      
      return {
        ...room,
        nights: duration,
        total: totalPerRoom
      };
    });
    
    onRoomArrangementsChange(updatedArrangements);
  }, [roomArrangements, duration]);

  // Add new room arrangement
  const addRoomArrangement = () => {
    const newRoomId = `room-${roomArrangements.length + 1}`;
    
    const newRoom: RoomArrangementType = {
      id: newRoomId,
      roomType: availableRoomTypes[0] || "Double Room",
      numRooms: 1,
      adults: 2,
      childrenWithBed: 0,
      childrenNoBed: 0,
      infants: 0,
      ratePerNight: {
        adult: 80,
        childWithBed: 60,
        childNoBed: 40,
        infant: 0
      },
      nights: duration,
      total: 0
    };
    
    // Calculate total for the new room
    const newTotal = 
      (newRoom.adults * newRoom.ratePerNight.adult + 
       newRoom.childrenWithBed * newRoom.ratePerNight.childWithBed + 
       newRoom.childrenNoBed * newRoom.ratePerNight.childNoBed) * 
      duration * newRoom.numRooms;
    
    newRoom.total = newTotal;
    
    onRoomArrangementsChange([...roomArrangements, newRoom]);
  };

  // Remove a room arrangement
  const removeRoomArrangement = (id: string) => {
    if (roomArrangements.length === 1) {
      toast.error("You must have at least one room arrangement");
      return;
    }
    
    const updatedArrangements = roomArrangements.filter(room => room.id !== id);
    onRoomArrangementsChange(updatedArrangements);
  };

  // Update room arrangement
  const updateRoomArrangement = (id: string, field: string, value: any) => {
    const updatedArrangements = roomArrangements.map(room => {
      if (room.id === id) {
        let updatedRoom = { ...room };
        
        if (field.startsWith("rate_")) {
          // Handle rate updates
          const rateType = field.split("_")[1];
          updatedRoom = {
            ...updatedRoom,
            ratePerNight: {
              ...updatedRoom.ratePerNight,
              [rateType]: parseFloat(value) || 0
            }
          };
        } else {
          // Handle other field updates
          updatedRoom = {
            ...updatedRoom,
            [field]: field === "roomType" ? value : (parseInt(value) || 0)
          };
        }
        
        // Check room capacity limits
        if ((field === "adults" || field === "childrenWithBed" || field === "roomType") && 
            updatedRoom.adults + updatedRoom.childrenWithBed > (roomCapacityLimits[updatedRoom.roomType] || 2)) {
          toast.warning(`Maximum capacity for ${updatedRoom.roomType} is ${roomCapacityLimits[updatedRoom.roomType] || 2} people (excluding CNB and infants)`);
          
          // Adjust adults or children to meet capacity limit
          const maxCapacity = roomCapacityLimits[updatedRoom.roomType] || 2;
          if (field === "adults") {
            updatedRoom.adults = Math.min(updatedRoom.adults, maxCapacity - updatedRoom.childrenWithBed);
          } else if (field === "childrenWithBed") {
            updatedRoom.childrenWithBed = Math.min(updatedRoom.childrenWithBed, maxCapacity - updatedRoom.adults);
          } else if (field === "roomType") {
            const totalBedOccupants = updatedRoom.adults + updatedRoom.childrenWithBed;
            if (totalBedOccupants > maxCapacity) {
              // Reset to reasonable defaults
              updatedRoom.adults = Math.min(updatedRoom.adults, maxCapacity);
              updatedRoom.childrenWithBed = Math.max(0, maxCapacity - updatedRoom.adults);
            }
          }
        }
        
        // Recalculate total
        if (duration > 0) {
          updatedRoom.nights = duration;
          updatedRoom.total = 
            (updatedRoom.adults * updatedRoom.ratePerNight.adult + 
             updatedRoom.childrenWithBed * updatedRoom.ratePerNight.childWithBed + 
             updatedRoom.childrenNoBed * updatedRoom.ratePerNight.childNoBed + 
             updatedRoom.infants * updatedRoom.ratePerNight.infant) * 
            duration * updatedRoom.numRooms;
        }
        
        return updatedRoom;
      }
      
      return room;
    });
    
    onRoomArrangementsChange(updatedArrangements);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Room Arrangements</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addRoomArrangement}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {roomArrangements.map((room, index) => (
          <div key={room.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Room {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRoomArrangement(room.id)}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Room Type</label>
                <Select 
                  value={room.roomType} 
                  onValueChange={(value) => updateRoomArrangement(room.id, "roomType", value)}
                >
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoomTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Max capacity: {roomCapacityLimits[room.roomType] || 2} persons
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Number of Rooms</label>
                <Input
                  type="number"
                  min="1"
                  value={room.numRooms}
                  onChange={(e) => updateRoomArrangement(room.id, "numRooms", e.target.value)}
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nights</label>
                <Input
                  type="number"
                  value={room.nights}
                  disabled
                  className="bg-gray-100 text-black"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Adults</label>
                <Input
                  type="number"
                  min="0"
                  value={room.adults}
                  onChange={(e) => updateRoomArrangement(room.id, "adults", e.target.value)}
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Child with Bed</label>
                <Input
                  type="number"
                  min="0"
                  value={room.childrenWithBed}
                  onChange={(e) => updateRoomArrangement(room.id, "childrenWithBed", e.target.value)}
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Child No Bed</label>
                <Input
                  type="number"
                  min="0"
                  value={room.childrenNoBed}
                  onChange={(e) => updateRoomArrangement(room.id, "childrenNoBed", e.target.value)}
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Infants</label>
                <Input
                  type="number"
                  min="0"
                  value={room.infants}
                  onChange={(e) => updateRoomArrangement(room.id, "infants", e.target.value)}
                  className="bg-white text-black"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <h5 className="text-sm font-medium mb-2">Per Person Rate per Night</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Adult Rate</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={room.ratePerNight.adult}
                    onChange={(e) => updateRoomArrangement(room.id, "rate_adult", e.target.value)}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Child with Bed</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={room.ratePerNight.childWithBed}
                    onChange={(e) => updateRoomArrangement(room.id, "rate_childWithBed", e.target.value)}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Child No Bed</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={room.ratePerNight.childNoBed}
                    onChange={(e) => updateRoomArrangement(room.id, "rate_childNoBed", e.target.value)}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Infant Rate</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={room.ratePerNight.infant}
                    onChange={(e) => updateRoomArrangement(room.id, "rate_infant", e.target.value)}
                    className="bg-white text-black"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-md flex justify-between items-center">
              <span className="text-sm">
                {room.numRooms} {room.roomType}{room.numRooms > 1 ? 's' : ''}: 
                {room.adults > 0 ? ` ${room.adults} Adults` : ''}
                {room.childrenWithBed > 0 ? `, ${room.childrenWithBed} CWB` : ''}
                {room.childrenNoBed > 0 ? `, ${room.childrenNoBed} CNB` : ''}
                {room.infants > 0 ? `, ${room.infants} Infants` : ''}
                {` × ${duration} nights`}
              </span>
              <span className="font-medium">${room.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm font-medium">Accommodation Subtotal</span>
          <span className="font-medium">
            ${roomArrangements.reduce((sum, room) => sum + room.total, 0).toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomArrangement;
