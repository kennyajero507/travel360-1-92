
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import HotelRoomTypes from "./HotelRoomTypes";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { RoomType } from "../types/hotel.types";

interface RoomRatePlan {
  id: string;
  roomTypeId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  rate: number;
  description: string;
}

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
  const [ratePlans, setRatePlans] = useState<RoomRatePlan[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [newRatePlan, setNewRatePlan] = useState<RoomRatePlan>({
    id: `rate-${Date.now()}`,
    roomTypeId: "",
    name: "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    rate: 0,
    description: "",
  });
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Initialize roomTypes from initialRoomTypes prop
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
    
    // Also remove associated rate plans
    setRatePlans(ratePlans.filter(plan => plan.roomTypeId !== id));
  };

  // Rate Plans Management
  const handleAddRatePlan = () => {
    if (!newRatePlan.roomTypeId || !newRatePlan.name) return;
    
    setRatePlans([...ratePlans, { ...newRatePlan, id: `rate-${Date.now()}` }]);
    setNewRatePlan({
      id: `rate-${Date.now()}`,
      roomTypeId: newRatePlan.roomTypeId,
      name: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      rate: 0,
      description: "",
    });
  };

  const handleRemoveRatePlan = (id: string) => {
    setRatePlans(ratePlans.filter(plan => plan.id !== id));
  };

  // Calendar-based pricing and availability
  const getRoomTypeById = (id: string) => {
    return roomTypes.find(roomType => roomType.id === id);
  };

  // Function to get current rate for a room type on a specific date
  const getRoomRateForDate = (roomTypeId: string, date: Date) => {
    const applicablePlans = ratePlans.filter(plan => 
      plan.roomTypeId === roomTypeId && 
      plan.startDate <= date && 
      plan.endDate >= date
    );
    
    if (applicablePlans.length > 0) {
      // Use the most recently added plan if multiple apply
      const plan = applicablePlans[applicablePlans.length - 1];
      return plan.rate;
    }
    
    // Fall back to base rate if no applicable rate plans
    const roomType = getRoomTypeById(roomTypeId);
    return roomType?.ratePerNight || 0;
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
            </TabsList>
            
            <TabsContent value="room-types" className="space-y-4">
              <HotelRoomTypes 
                roomTypes={roomTypes}
                onAddRoomType={handleAddRoomType}
                onUpdateRoomType={handleUpdateRoomType}
                onRemoveRoomType={handleRemoveRoomType}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelRoomManagement;
