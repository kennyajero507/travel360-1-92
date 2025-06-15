import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import HotelRoomTypes from "./HotelRoomTypes";
import { RoomType } from "../types/hotel.types";
import InventoryCalendar from "./hotel/InventoryCalendar";

interface HotelRoomManagementProps {
  hotelId: string;
  hotelName: string;
  onSaveRoomTypes?: (roomTypes: RoomType[]) => void;
  initialRoomTypes?: RoomType[];
}

const HotelRoomManagement = ({ 
  hotelId, 
  hotelName, 
  onSaveRoomTypes,
  initialRoomTypes = [] 
}: HotelRoomManagementProps) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes);
  
  useEffect(() => {
    if (initialRoomTypes && initialRoomTypes.length > 0) {
      setRoomTypes(initialRoomTypes);
    }
  }, [initialRoomTypes]);

  // Notify parent component when room types change
  useEffect(() => {
    if (onSaveRoomTypes) {
      onSaveRoomTypes(roomTypes);
    }
  }, [roomTypes, onSaveRoomTypes]);


  // Room Types Management
  const handleAddRoomType = (roomType: RoomType) => {
    const updatedRoomTypes = [...roomTypes, roomType];
    setRoomTypes(updatedRoomTypes);
  };

  const handleUpdateRoomType = (id: string, field: keyof RoomType, value: any) => {
    const updatedRoomTypes = roomTypes.map(roomType => 
      roomType.id === id ? { ...roomType, [field]: value } : roomType
    );
    setRoomTypes(updatedRoomTypes);
  };

  const handleRemoveRoomType = (id: string) => {
    const updatedRoomTypes = roomTypes.filter(roomType => roomType.id !== id);
    setRoomTypes(updatedRoomTypes);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Room Management for {hotelName}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="room-types">
            <TabsList className="mb-4">
              <TabsTrigger value="room-types">Room Types</TabsTrigger>
              <TabsTrigger value="inventory">Inventory & Availability</TabsTrigger>
            </TabsList>
            
            <TabsContent value="room-types" className="space-y-4">
              <HotelRoomTypes 
                roomTypes={roomTypes}
                onAddRoomType={handleAddRoomType}
                onUpdateRoomType={handleUpdateRoomType}
                onRemoveRoomType={handleRemoveRoomType}
              />
            </TabsContent>
            <TabsContent value="inventory" className="space-y-4">
              {roomTypes.length > 0 ? (
                <InventoryCalendar hotelId={hotelId} roomTypes={roomTypes} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please add at least one room type to manage inventory.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelRoomManagement;
