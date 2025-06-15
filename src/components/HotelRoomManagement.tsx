
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import HotelRoomTypes from "./HotelRoomTypes";
import { RoomType } from "../types/hotel.types";
import InventoryCalendar from "./hotel/InventoryCalendar";
import RoomSummaryCards from "./hotel/RoomSummaryCards";
import { useInventoryData } from "../hooks/useInventoryData";

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

  // Load inventory for summary cards
  const today = new Date();
  const { inventory } = useInventoryData(hotelId, today.getFullYear(), today.getMonth());

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
    setRoomTypes([...roomTypes, roomType]);
  };

  const handleUpdateRoomType = (id: string, field: keyof RoomType, value: any) => {
    setRoomTypes(roomTypes.map(roomType => 
      roomType.id === id ? { ...roomType, [field]: value } : roomType
    ));
  };

  const handleRemoveRoomType = (id: string) => {
    setRoomTypes(roomTypes.filter(roomType => roomType.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">
            Room Management for {hotelName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Analytics summary cards */}
          <RoomSummaryCards roomTypes={roomTypes} inventory={inventory} />

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
                hotelId={hotelId}
                hotelName={hotelName}
                // The props below assist for error-handling/feedback from page above if needed
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
