
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";
import { Save, Building, Home } from "lucide-react";
import HotelForm from "../components/HotelForm";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import HotelRoomManagement from "../components/HotelRoomManagement";

const CreateHotel = () => {
  const navigate = useNavigate();
  const { permissions, role } = useRole();
  
  // Redirect if user doesn't have permission to add hotels
  if (!permissions.canAddHotels) {
    toast.error("You don't have permission to add hotels");
    navigate("/hotels");
    return null;
  }

  const [hotelData, setHotelData] = useState({
    id: `hotel-${Date.now()}`,
    name: "",
    address: "",
    destination: "",
    category: "",
    contactDetails: {}
  });
  
  const [additionalDetails, setAdditionalDetails] = useState({
    description: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    hasNegotiatedRate: false,
    website: ""
  });
  
  const handleHotelSubmit = (hotelFormData: any) => {
    // Combine form data with additional details
    const finalData = {
      ...hotelData,
      ...hotelFormData,
      additionalDetails
    };
    
    // Store the hotelData state for room management
    setHotelData({
      ...hotelData,
      ...hotelFormData
    });
    
    // In a real app, save to database via API
    console.log("Hotel data:", finalData);
    
    toast.success("Hotel details saved! You can now manage room types.");
    
    // Switch to rooms tab after saving hotel details
    const roomsTab = document.getElementById("rooms-tab");
    if (roomsTab) {
      (roomsTab as HTMLButtonElement).click();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will trigger form submission in the HotelForm component
    document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Add New Hotel</h1>
          <p className="text-gray-500 mt-2">
            {role === 'agent' ? 'Add a new hotel to your submissions' : 'Add a new hotel to your inventory'}
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="hotel-details">
        <TabsList>
          <TabsTrigger value="hotel-details" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Hotel Details
          </TabsTrigger>
          <TabsTrigger 
            value="rooms" 
            id="rooms-tab" 
            className="flex items-center gap-2"
            disabled={!hotelData.name}
          >
            <Home className="h-4 w-4" />
            Room Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hotel-details" className="space-y-6 pt-4">
          <HotelForm onSubmit={handleHotelSubmit} />
          
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
                    className="w-full min-h-[100px] p-3 border rounded-md bg-white text-black"
                    value={additionalDetails.description}
                    onChange={(e) => setAdditionalDetails({ ...additionalDetails, description: e.target.value })}
                    placeholder="Describe the hotel, its features, and any special notes"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium mb-2">
                      Contact Person
                    </label>
                    <Input
                      id="contactPerson"
                      value={additionalDetails.contactPerson}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, contactPerson: e.target.value })}
                      placeholder="Hotel contact person"
                      className="bg-white text-black"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
                      Contact Email
                    </label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={additionalDetails.contactEmail}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, contactEmail: e.target.value })}
                      placeholder="Contact email address"
                      className="bg-white text-black"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium mb-2">
                      Contact Phone
                    </label>
                    <Input
                      id="contactPhone"
                      value={additionalDetails.contactPhone}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, contactPhone: e.target.value })}
                      placeholder="Contact phone number"
                      className="bg-white text-black"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium mb-2">
                      Hotel Website
                    </label>
                    <Input
                      id="website"
                      type="url"
                      value={additionalDetails.website}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, website: e.target.value })}
                      placeholder="e.g., https://www.hotelwebsite.com"
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="hasNegotiatedRate"
                    checked={additionalDetails.hasNegotiatedRate}
                    onCheckedChange={(checked) => 
                      setAdditionalDetails({ ...additionalDetails, hasNegotiatedRate: checked === true })
                    }
                  />
                  <label htmlFor="hasNegotiatedRate" className="text-sm font-medium">
                    This hotel has negotiated rates (special contract rates)
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/hotels")}>
              Cancel
            </Button>
            <Button type="button" onClick={handleFormSubmit} className="bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" />
              Save Hotel Details
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="rooms" className="pt-4">
          {hotelData.name ? (
            <div className="space-y-6">
              <HotelRoomManagement 
                hotelId={hotelData.id} 
                hotelName={hotelData.name} 
              />
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/hotels")}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    toast.success("Hotel and rooms saved successfully!");
                    navigate("/hotels");
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Complete Hotel Setup
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-gray-500 mb-4">Please save hotel details first before managing rooms</p>
              <Button onClick={() => {
                const detailsTab = document.getElementById("hotel-details-tab");
                if (detailsTab) {
                  (detailsTab as HTMLButtonElement).click();
                }
              }}>
                Return to Hotel Details
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateHotel;
