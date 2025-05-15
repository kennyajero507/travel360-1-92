
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

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
    category: initialData.category || "",
    address: initialData.address || "",
    destination: initialData.destination || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Basic Hotel Information</CardTitle>
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
              className="bg-white text-black"
            />
          </div>
          
          <div>
            <Label htmlFor="address">Hotel Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
              required
              className="bg-white text-black"
            />
          </div>
          
          <div>
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="City, Country"
              required
              className="bg-white text-black"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Hotel Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category" className="bg-white text-black">
                <SelectValue placeholder="Select hotel category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Luxury">Luxury</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Budget">Budget</SelectItem>
                <SelectItem value="Resort">Resort</SelectItem>
                <SelectItem value="Boutique">Boutique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="starRating">Hotel Star Rating</Label>
            <Select 
              value={formData.starRating} 
              onValueChange={(value) => setFormData({ ...formData, starRating: value })}
            >
              <SelectTrigger id="starRating" className="bg-white text-black">
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
      
      <div className="flex justify-end space-x-4">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Hotel</Button>
      </div>
    </form>
  );
};

export default HotelForm;
