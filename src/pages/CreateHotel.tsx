
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { toast } from "sonner";
import { Save, X, Plus } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";

interface HotelFormData {
  name: string;
  location: string;
  address: string;
  category: string;
  ratePerNight: number;
  hasNegotiatedRate: boolean;
  amenities: string[];
  description: string;
  contactPerson: string;
  contactEmail: string;
}

const amenitiesOptions = [
  "Pool", "Spa", "Gym", "Restaurant", "WiFi", "Beach Access", 
  "Room Service", "Conference Facilities", "Parking", "Airport Shuttle",
  "Bar/Lounge", "Concierge", "Air Conditioning", "Game Drives", "Business Center"
];

const CreateHotel = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<HotelFormData>({
    name: "",
    location: "",
    address: "",
    category: "4-Star",
    ratePerNight: 0,
    hasNegotiatedRate: false,
    amenities: [],
    description: "",
    contactPerson: "",
    contactEmail: ""
  });

  const [newAmenity, setNewAmenity] = useState("");

  const handleAddAmenity = () => {
    if (newAmenity && !formData.amenities.includes(newAmenity)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity]
      });
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    });
  };

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, save to database via API
    console.log("Hotel data:", formData);
    
    toast.success("Hotel added successfully!");
    navigate("/hotels");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Hotel</h1>
          <p className="text-gray-500 mt-2">Add a new hotel to your inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Hotel Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter hotel name"
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium mb-2">
                  Address
                </label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-Star">5-Star</SelectItem>
                    <SelectItem value="4-Star">4-Star</SelectItem>
                    <SelectItem value="3-Star">3-Star</SelectItem>
                    <SelectItem value="Budget">Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="ratePerNight" className="block text-sm font-medium mb-2">
                  Rate per Night ($)
                </label>
                <Input
                  id="ratePerNight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ratePerNight}
                  onChange={(e) => setFormData({ ...formData, ratePerNight: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="md:col-span-2 flex items-center space-x-2">
                <Checkbox
                  id="hasNegotiatedRate"
                  checked={formData.hasNegotiatedRate}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, hasNegotiatedRate: checked === true })
                  }
                />
                <label htmlFor="hasNegotiatedRate" className="text-sm font-medium">
                  This hotel has negotiated rates (special contract rates)
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenitiesOptions.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <label htmlFor={`amenity-${amenity}`} className="text-sm">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Add Custom Amenity
                </label>
                <div className="flex gap-3">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Enter custom amenity"
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddAmenity}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              
              {formData.amenities.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Selected Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(amenity)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Hotel Description
                </label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] p-3 border rounded-md"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the hotel, its features, and any special notes"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium mb-2">
                    Contact Person
                  </label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Hotel contact person"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
                    Contact Email
                  </label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="Contact email address"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/hotels")}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Hotel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateHotel;
