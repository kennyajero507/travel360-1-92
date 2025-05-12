
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Plus, X } from "lucide-react";

interface RoomType {
  id: string;
  name: string;
  maxOccupancy: number;
  bedOptions: string;
  ratePerNight: number;
  amenities: string[];
  totalUnits: number;
}

interface HotelRoomTypesProps {
  roomTypes: RoomType[];
  onAddRoomType: (roomType: RoomType) => void;
  onUpdateRoomType: (id: string, field: keyof RoomType, value: any) => void;
  onRemoveRoomType: (id: string) => void;
}

const bedOptions = [
  "King", "Queen", "Twin", "Double", "Single", "Bunk", "Sofa Bed"
];

const availableAmenities = [
  "Free Wi-Fi", "Air Conditioning", "TV", "Mini-bar", "Private Bathroom", 
  "Balcony", "Sea View", "Breakfast Included", "Room Service", "Safe"
];

const HotelRoomTypes = ({ 
  roomTypes, 
  onAddRoomType, 
  onUpdateRoomType, 
  onRemoveRoomType 
}: HotelRoomTypesProps) => {
  const [newRoomType, setNewRoomType] = useState<RoomType>({
    id: `room-${Date.now()}`,
    name: "",
    maxOccupancy: 2,
    bedOptions: "Queen",
    ratePerNight: 0,
    amenities: ["Free Wi-Fi"],
    totalUnits: 1
  });

  const handleAddRoomType = () => {
    if (!newRoomType.name) {
      return;
    }
    onAddRoomType({...newRoomType, id: `room-${Date.now()}`});
    setNewRoomType({
      id: `room-${Date.now()}`,
      name: "",
      maxOccupancy: 2,
      bedOptions: "Queen",
      ratePerNight: 0,
      amenities: ["Free Wi-Fi"],
      totalUnits: 1
    });
  };

  const handleAmenityToggle = (amenity: string, isChecked: boolean, roomTypeId?: string) => {
    if (roomTypeId) {
      // Updating existing room type
      const roomType = roomTypes.find(rt => rt.id === roomTypeId);
      if (roomType) {
        const updatedAmenities = isChecked 
          ? [...roomType.amenities, amenity]
          : roomType.amenities.filter(a => a !== amenity);
        
        onUpdateRoomType(roomTypeId, 'amenities', updatedAmenities);
      }
    } else {
      // Updating new room type form
      const updatedAmenities = isChecked 
        ? [...newRoomType.amenities, amenity]
        : newRoomType.amenities.filter(a => a !== amenity);
      
      setNewRoomType({...newRoomType, amenities: updatedAmenities});
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* List of existing room types */}
            {roomTypes.map((roomType) => (
              <Card key={roomType.id} className="border border-gray-200">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{roomType.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemoveRoomType(roomType.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Type Name</label>
                      <Input 
                        value={roomType.name} 
                        onChange={(e) => onUpdateRoomType(roomType.id, 'name', e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Occupancy</label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="10"
                        value={roomType.maxOccupancy} 
                        onChange={(e) => onUpdateRoomType(roomType.id, 'maxOccupancy', parseInt(e.target.value))}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Bed Options</label>
                      <Select 
                        value={roomType.bedOptions}
                        onValueChange={(value) => onUpdateRoomType(roomType.id, 'bedOptions', value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {bedOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Rate per Night ($)</label>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={roomType.ratePerNight} 
                        onChange={(e) => onUpdateRoomType(roomType.id, 'ratePerNight', parseFloat(e.target.value))}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Total Units</label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={roomType.totalUnits} 
                        onChange={(e) => onUpdateRoomType(roomType.id, 'totalUnits', parseInt(e.target.value))}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {availableAmenities.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`${roomType.id}-${amenity}`} 
                            checked={roomType.amenities.includes(amenity)}
                            onCheckedChange={(checked) => 
                              handleAmenityToggle(amenity, checked === true, roomType.id)
                            }
                          />
                          <label 
                            htmlFor={`${roomType.id}-${amenity}`}
                            className="text-sm"
                          >
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add new room type form */}
            <Card className="border border-dashed border-gray-300 bg-gray-50">
              <CardContent className="pt-4">
                <h3 className="text-lg font-semibold mb-4">Add New Room Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Room Type Name *</label>
                    <Input 
                      value={newRoomType.name} 
                      onChange={(e) => setNewRoomType({...newRoomType, name: e.target.value})}
                      placeholder="e.g. Deluxe Double Room"
                      className="bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Occupancy</label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={newRoomType.maxOccupancy} 
                      onChange={(e) => setNewRoomType({...newRoomType, maxOccupancy: parseInt(e.target.value)})}
                      className="bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Bed Options</label>
                    <Select 
                      value={newRoomType.bedOptions}
                      onValueChange={(value) => setNewRoomType({...newRoomType, bedOptions: value})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bedOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Rate per Night ($)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={newRoomType.ratePerNight} 
                      onChange={(e) => setNewRoomType({...newRoomType, ratePerNight: parseFloat(e.target.value)})}
                      className="bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Units</label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={newRoomType.totalUnits} 
                      onChange={(e) => setNewRoomType({...newRoomType, totalUnits: parseInt(e.target.value)})}
                      className="bg-white"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {availableAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`new-${amenity}`} 
                          checked={newRoomType.amenities.includes(amenity)}
                          onCheckedChange={(checked) => 
                            handleAmenityToggle(amenity, checked === true)
                          }
                        />
                        <label 
                          htmlFor={`new-${amenity}`}
                          className="text-sm"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button onClick={handleAddRoomType} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room Type
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelRoomTypes;
