
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";
import { Building, Home, ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Hotel } from "../types/hotel.types";
import HotelDetailsTab from "../components/hotel/HotelDetailsTab";
import RoomManagementTab from "../components/hotel/RoomManagementTab";

const EditHotel = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const { permissions } = useRole();
  
  // Redirect if user doesn't have permission to edit hotels
  useEffect(() => {
    if (!permissions.canEditHotels) {
      toast.error("You don't have permission to edit hotels");
      navigate("/hotels");
    }
  }, [permissions, navigate]);

  const [hotelData, setHotelData] = useState<Hotel>({
    id: "",
    name: "",
    address: "",
    destination: "",
    category: "",
    contactDetails: {},
    roomTypes: []
  });
  
  const [additionalDetails, setAdditionalDetails] = useState({
    description: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    hasNegotiatedRate: false,
    website: ""
  });

  // Load hotel data
  useEffect(() => {
    try {
      const hotels = JSON.parse(localStorage.getItem('hotels') || '[]');
      const foundHotel = hotels.find((h: Hotel) => h.id === hotelId);
      
      if (foundHotel) {
        console.log("Found hotel:", foundHotel);
        setHotelData(foundHotel);
        
        if (foundHotel.additionalDetails) {
          setAdditionalDetails({
            description: foundHotel.additionalDetails.description || "",
            contactPerson: foundHotel.additionalDetails.contactPerson || "",
            contactEmail: foundHotel.additionalDetails.contactEmail || "",
            contactPhone: foundHotel.additionalDetails.contactPhone || "",
            hasNegotiatedRate: foundHotel.additionalDetails.hasNegotiatedRate || false,
            website: foundHotel.additionalDetails.website || ""
          });
        }
      } else {
        toast.error("Hotel not found");
        navigate("/hotels");
      }
    } catch (error) {
      console.error("Error loading hotel data:", error);
      toast.error("Failed to load hotel data");
    }
  }, [hotelId, navigate]);
  
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
    
    // Save to localStorage
    try {
      const hotels = JSON.parse(localStorage.getItem('hotels') || '[]');
      const hotelIndex = hotels.findIndex((h: Hotel) => h.id === hotelId);
      
      if (hotelIndex >= 0) {
        hotels[hotelIndex] = {
          ...hotels[hotelIndex],
          ...finalData,
          roomTypes: hotels[hotelIndex].roomTypes || []
        };
        
        localStorage.setItem('hotels', JSON.stringify(hotels));
        toast.success("Hotel details updated successfully!");
        
        // Switch to rooms tab after saving hotel details
        const roomsTab = document.getElementById("edit-rooms-tab");
        if (roomsTab) {
          (roomsTab as HTMLButtonElement).click();
        }
      }
    } catch (error) {
      console.error("Error updating hotel data:", error);
      toast.error("Failed to update hotel data");
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
      const hotelIndex = hotels.findIndex((h: Hotel) => h.id === hotelId);
      
      if (hotelIndex >= 0) {
        hotels[hotelIndex] = {
          ...hotels[hotelIndex],
          ...hotelData,
          roomTypes,
          additionalDetails
        };
        
        localStorage.setItem('hotels', JSON.stringify(hotels));
        toast.success("Hotel and room data updated successfully!");
      }
    } catch (error) {
      console.error("Error updating hotel data:", error);
      toast.error("Failed to update hotel data");
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/hotels/${hotelId}`)}>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Back</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600">Edit Hotel</h1>
          </div>
          <p className="text-gray-500 mt-2">
            {hotelData.name || "Loading..."}
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
            id="edit-rooms-tab" 
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Room Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hotel-details">
          <HotelDetailsTab 
            hotelData={hotelData}
            additionalDetails={additionalDetails}
            setAdditionalDetails={setAdditionalDetails}
            onHotelSubmit={handleHotelSubmit}
            onCancel={() => navigate(`/hotels/${hotelId}`)}
            handleFormSubmit={handleFormSubmit}
          />
        </TabsContent>
        
        <TabsContent value="rooms" className="pt-4">
          <RoomManagementTab 
            hotelId={hotelData.id}
            hotelName={hotelData.name}
            roomTypes={hotelData.roomTypes || []}
            onSaveRoomTypes={handleRoomTypesUpdate}
            onCancel={() => navigate(`/hotels/${hotelId}`)}
            onComplete={() => navigate(`/hotels/${hotelId}`)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditHotel;
