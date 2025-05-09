
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface HotelFormProps {
  onSubmit: (hotelData: any) => void;
  initialData?: any;
}

const HotelForm = ({ onSubmit, initialData = {} }: HotelFormProps) => {
  const [formData, setFormData] = useState({
    // Basic Hotel Info
    name: initialData.name || "",
    location: initialData.location || "",
    starRating: initialData.starRating || "",
    
    // Booking Details
    checkInDate: initialData.checkInDate || "",
    checkOutDate: initialData.checkOutDate || "",
    nights: initialData.nights || 0,
    
    // Room Details
    roomType: initialData.roomType || "Double",
    adultOccupancy: initialData.adultOccupancy || 2,
    childOccupancy: initialData.childOccupancy || 0,
    ratePerNight: initialData.ratePerNight || 0,
    numberOfRooms: initialData.numberOfRooms || 1,
    totalCost: initialData.totalCost || 0
  });

  // Calculate number of nights when check-in/check-out dates change
  const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Calculate the time difference in milliseconds
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    
    // Convert milliseconds to days
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };
  
  // Calculate total cost when relevant fields change
  const calculateTotalCost = (rate: number, nights: number, rooms: number) => {
    return rate * nights * rooms;
  };
  
  // Handle date changes and recalculate nights
  const handleDateChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    
    if (field === 'checkInDate' || field === 'checkOutDate') {
      const nights = calculateNights(
        field === 'checkInDate' ? value : formData.checkInDate,
        field === 'checkOutDate' ? value : formData.checkOutDate
      );
      
      newData.nights = nights;
      newData.totalCost = calculateTotalCost(
        newData.ratePerNight, 
        nights, 
        newData.numberOfRooms
      );
    }
    
    setFormData(newData);
  };
  
  // Handle changes to rate, number of rooms
  const handleCostFactorChange = (field: string, value: number) => {
    const newData = { ...formData, [field]: value };
    
    newData.totalCost = calculateTotalCost(
      field === 'ratePerNight' ? value : newData.ratePerNight,
      newData.nights,
      field === 'numberOfRooms' ? value : newData.numberOfRooms
    );
    
    setFormData(newData);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Hotel Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Hotel Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter hotel name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="location">Hotel Location / Destination</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="starRating">Hotel Star Rating (Optional)</Label>
            <Select 
              value={formData.starRating} 
              onValueChange={(value) => setFormData({ ...formData, starRating: value })}
            >
              <SelectTrigger id="starRating">
                <SelectValue placeholder="Select star rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-Star">1-Star</SelectItem>
                <SelectItem value="2-Star">2-Star</SelectItem>
                <SelectItem value="3-Star">3-Star</SelectItem>
                <SelectItem value="4-Star">4-Star</SelectItem>
                <SelectItem value="5-Star">5-Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <Input
                id="checkInDate"
                type="date"
                value={formData.checkInDate}
                onChange={(e) => handleDateChange('checkInDate', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <Input
                id="checkOutDate"
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => handleDateChange('checkOutDate', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="nights">Number of Nights</Label>
            <Input
              id="nights"
              type="number"
              value={formData.nights}
              readOnly
              className="bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Auto-calculated from check-in/check-out dates
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roomType">Room Type</Label>
              <Select 
                value={formData.roomType} 
                onValueChange={(value) => setFormData({ ...formData, roomType: value })}
              >
                <SelectTrigger id="roomType">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Double">Double</SelectItem>
                  <SelectItem value="Twin">Twin</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Suite">Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="numberOfRooms">Number of Rooms</Label>
              <Input
                id="numberOfRooms"
                type="number"
                min="1"
                value={formData.numberOfRooms}
                onChange={(e) => handleCostFactorChange('numberOfRooms', parseInt(e.target.value))}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adultOccupancy">Number of Adults</Label>
              <Input
                id="adultOccupancy"
                type="number"
                min="1"
                value={formData.adultOccupancy}
                onChange={(e) => setFormData({ ...formData, adultOccupancy: parseInt(e.target.value) })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="childOccupancy">Number of Children</Label>
              <Input
                id="childOccupancy"
                type="number"
                min="0"
                value={formData.childOccupancy}
                onChange={(e) => setFormData({ ...formData, childOccupancy: parseInt(e.target.value) })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ratePerNight">Rate per Night (Base Cost)</Label>
              <Input
                id="ratePerNight"
                type="number"
                min="0"
                step="0.01"
                value={formData.ratePerNight}
                onChange={(e) => handleCostFactorChange('ratePerNight', parseFloat(e.target.value))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="totalCost">Total Room Cost</Label>
              <Input
                id="totalCost"
                type="number"
                value={formData.totalCost}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Rate × Nights × Number of Rooms
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default HotelForm;
