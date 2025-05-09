
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";
import { Save } from "lucide-react";
import HotelForm from "../components/HotelForm";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";

const CreateHotel = () => {
  const navigate = useNavigate();
  const { permissions } = useRole();
  
  // Redirect if user doesn't have permission to add hotels
  if (!permissions.canAddHotels) {
    toast.error("You don't have permission to add hotels");
    navigate("/hotels");
    return null;
  }
  
  const [additionalDetails, setAdditionalDetails] = useState({
    description: "",
    contactPerson: "",
    contactEmail: "",
    hasNegotiatedRate: false
  });
  
  const handleHotelSubmit = (hotelFormData: any) => {
    // Combine form data with additional details
    const finalData = {
      ...hotelFormData,
      ...additionalDetails
    };
    
    // In a real app, save to database via API
    console.log("Hotel data:", finalData);
    
    toast.success("Hotel added successfully!");
    navigate("/hotels");
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
          <h1 className="text-3xl font-bold tracking-tight">Add New Hotel</h1>
          <p className="text-gray-500 mt-2">Add a new hotel to your inventory</p>
        </div>
      </div>

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
                className="w-full min-h-[100px] p-3 border rounded-md"
                value={additionalDetails.description}
                onChange={(e) => setAdditionalDetails({ ...additionalDetails, description: e.target.value })}
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
                  value={additionalDetails.contactPerson}
                  onChange={(e) => setAdditionalDetails({ ...additionalDetails, contactPerson: e.target.value })}
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
                  value={additionalDetails.contactEmail}
                  onChange={(e) => setAdditionalDetails({ ...additionalDetails, contactEmail: e.target.value })}
                  placeholder="Contact email address"
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
        <Button type="button" onClick={handleFormSubmit}>
          <Save className="mr-2 h-4 w-4" />
          Save Hotel
        </Button>
      </div>
    </div>
  );
};

export default CreateHotel;
