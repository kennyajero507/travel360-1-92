
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";
import { Building, Hotel } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Hotel as HotelType } from "../types/hotel.types";
import HotelDetailsTab from "../components/hotel/HotelDetailsTab";
import RoomManagementTab from "../components/hotel/RoomManagementTab";

const CreateHotel = () => {
  const navigate = useNavigate();
  const { permissions, role } = useRole();
  
  // Redirect if user doesn't have permission to add hotels
  if (!permissions.canAddHotels) {
    toast.error("You don't have permission to add hotels");
    navigate("/hotels");
    return null;
  }

  const [hotelData, setHotelData] = useState<HotelType>({
    id: `hotel-${Date.now()}`,
    name: "",
    address: "",
    destination: "",
    category: "",
    contactDetails: {},
    roomTypes: [],
    status: "Active" // Set default status to Active
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
    
    // Save to localStorage for later access
    try {
      const hotels = JSON.parse(localStorage.getItem('hotels') || '[]');
      const existingIndex = hotels.findIndex((h: HotelType) => h.id === hotelData.id);
      
      if (existingIndex >= 0) {
        hotels[existingIndex] = {
          ...hotels[existingIndex],
          ...finalData
        };
      } else {
        hotels.push(finalData);
      }
      
      localStorage.setItem('hotels', JSON.stringify(hotels));
    } catch (error) {
      console.error("Error saving hotel:", error);
    }
    
    toast.success("Hotel details saved! You can now manage room types.");
    
    // Switch to rooms tab after saving hotel details
    const roomsTab = document.getElementById("rooms-tab");
    if (roomsTab) {
      (roomsTab as HTMLButtonElement).click();
    }
  };
  
  // Update hotelData with room types from the room management component
  const handleRoomTypesUpdate = (roomTypes: any[]) => {
    setHotelData({
      ...hotelData,
      roomTypes
    });
    
    // Save to localStorage
    try {
      const hotels = JSON.parse(localStorage.getItem('hotels') || '[]');
      const existingHotelIndex = hotels.findIndex((h: any) => h.id === hotelData.id);
      
      if (existingHotelIndex >= 0) {
        hotels[existingHotelIndex] = {
          ...hotels[existingHotelIndex],
          ...hotelData,
          roomTypes,
          additionalDetails
        };
      } else {
        hotels.push({
          ...hotelData,
          roomTypes,
          additionalDetails
        });
      }
      
      localStorage.setItem('hotels', JSON.stringify(hotels));
      toast.success("Hotel and room data saved successfully!");
    } catch (error) {
      console.error("Error saving hotel data:", error);
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
          <TabsTrigger value="hotel-details" id="hotel-details-tab" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Hotel Details
          </TabsTrigger>
          <TabsTrigger 
            value="rooms" 
            id="rooms-tab" 
            className="flex items-center gap-2"
            disabled={!hotelData.name}
          >
            <Hotel className="h-4 w-4" />
            Room Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hotel-details">
          <HotelDetailsTab 
            hotelData={hotelData}
            additionalDetails={additionalDetails}
            setAdditionalDetails={setAdditionalDetails}
            onHotelSubmit={handleHotelSubmit}
            onCancel={() => navigate("/hotels")}
            handleFormSubmit={handleFormSubmit}
          />
        </TabsContent>
        
        <TabsContent value="rooms" className="pt-4">
          <RoomManagementTab 
            hotelId={hotelData.id}
            hotelName={hotelData.name}
            roomTypes={hotelData.roomTypes || []}
            onSaveRoomTypes={handleRoomTypesUpdate}
            onCancel={() => navigate("/hotels")}
            onComplete={() => navigate("/hotels")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateHotel;
