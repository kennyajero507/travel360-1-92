import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import HotelRoomTypes from "./HotelRoomTypes";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

interface RoomType {
  id: string;
  name: string;
  maxOccupancy: number;
  bedOptions: string;
  ratePerNight: number;
  amenities: string[];
  totalUnits: number;
}

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
}

const HotelRoomManagement = ({ hotelId, hotelName }: HotelRoomManagementProps) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
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
              <TabsTrigger value="rate-plans">Rate Plans</TabsTrigger>
              <TabsTrigger value="availability">Availability Calendar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="room-types" className="space-y-4">
              <HotelRoomTypes 
                roomTypes={roomTypes}
                onAddRoomType={handleAddRoomType}
                onUpdateRoomType={handleUpdateRoomType}
                onRemoveRoomType={handleRemoveRoomType}
              />
            </TabsContent>
            
            <TabsContent value="rate-plans" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Existing Rate Plans */}
                    {ratePlans.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-3">Current Rate Plans</h3>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left pb-2">Room Type</th>
                              <th className="text-left pb-2">Plan Name</th>
                              <th className="text-left pb-2">Valid Period</th>
                              <th className="text-right pb-2">Rate</th>
                              <th className="text-right pb-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ratePlans.map((plan) => {
                              const roomType = getRoomTypeById(plan.roomTypeId);
                              return (
                                <tr key={plan.id} className="border-b">
                                  <td className="py-2">{roomType?.name || "Unknown"}</td>
                                  <td className="py-2">{plan.name}</td>
                                  <td className="py-2">
                                    {plan.startDate.toLocaleDateString()} - {plan.endDate.toLocaleDateString()}
                                  </td>
                                  <td className="text-right py-2">${plan.rate.toFixed(2)}</td>
                                  <td className="text-right py-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleRemoveRatePlan(plan.id)}
                                    >
                                      Remove
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* Add New Rate Plan */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-lg font-medium mb-3">Add New Rate Plan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Room Type *</label>
                          <Select 
                            value={newRatePlan.roomTypeId}
                            onValueChange={(value) => setNewRatePlan({...newRatePlan, roomTypeId: value})}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                              {roomTypes.map((roomType) => (
                                <SelectItem key={roomType.id} value={roomType.id}>
                                  {roomType.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Plan Name *</label>
                          <Input 
                            value={newRatePlan.name}
                            onChange={(e) => setNewRatePlan({...newRatePlan, name: e.target.value})}
                            placeholder="e.g. Summer 2024"
                            className="bg-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Start Date</label>
                          <Input 
                            type="date"
                            value={newRatePlan.startDate.toISOString().split('T')[0]}
                            onChange={(e) => setNewRatePlan({
                              ...newRatePlan, 
                              startDate: new Date(e.target.value)
                            })}
                            className="bg-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">End Date</label>
                          <Input 
                            type="date"
                            value={newRatePlan.endDate.toISOString().split('T')[0]}
                            onChange={(e) => setNewRatePlan({
                              ...newRatePlan, 
                              endDate: new Date(e.target.value)
                            })}
                            className="bg-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Rate per Night ($)</label>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            value={newRatePlan.rate}
                            onChange={(e) => setNewRatePlan({
                              ...newRatePlan, 
                              rate: parseFloat(e.target.value)
                            })}
                            className="bg-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <Input 
                            value={newRatePlan.description}
                            onChange={(e) => setNewRatePlan({...newRatePlan, description: e.target.value})}
                            placeholder="e.g. Special rate for summer season"
                            className="bg-white"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          onClick={handleAddRatePlan} 
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!newRatePlan.roomTypeId || !newRatePlan.name}
                        >
                          Add Rate Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Room Type</label>
                      <Select 
                        value={selectedRoomTypeId}
                        onValueChange={setSelectedRoomTypeId}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((roomType) => (
                            <SelectItem key={roomType.id} value={roomType.id}>
                              {roomType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedRoomTypeId && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <h4 className="font-medium mb-2">
                            {getRoomTypeById(selectedRoomTypeId)?.name} Details
                          </h4>
                          <p className="text-sm">
                            <span className="font-medium">Base Rate:</span> $
                            {getRoomTypeById(selectedRoomTypeId)?.ratePerNight.toFixed(2)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Max Occupancy:</span> 
                            {getRoomTypeById(selectedRoomTypeId)?.maxOccupancy} persons
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Bed Options:</span> 
                            {getRoomTypeById(selectedRoomTypeId)?.bedOptions}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Total Units:</span> 
                            {getRoomTypeById(selectedRoomTypeId)?.totalUnits} rooms
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Room Availability</label>
                      <div className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-blue-600">
                            {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </h4>
                        </div>
                        <Calendar
                          mode="single"
                          selected={availabilityDate}
                          onSelect={setAvailabilityDate}
                          month={selectedMonth}
                          onMonthChange={setSelectedMonth}
                          className="p-3 pointer-events-auto mx-auto"
                        />
                        
                        {selectedRoomTypeId && availabilityDate && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-md">
                            <h4 className="font-medium mb-2">Selected Date: {availabilityDate.toLocaleDateString()}</h4>
                            <p>
                              <span className="font-medium">Rate:</span> $
                              {getRoomRateForDate(selectedRoomTypeId, availabilityDate).toFixed(2)}
                            </p>
                            <p>
                              <span className="font-medium">Available Units:</span> 
                              {getRoomTypeById(selectedRoomTypeId)?.totalUnits || 0}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelRoomManagement;
