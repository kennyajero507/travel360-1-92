
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import HotelForm from "../components/HotelForm";
import { hotelService } from "../services/hotelService";
import { Hotel } from "../types/hotel.types";
import { errorHandler } from "../services/errorHandlingService";

const CreateHotel = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleHotelSubmit = async (hotelData: Partial<Hotel>) => {
    setIsLoading(true);
    try {
      const newHotel = await hotelService.createHotel(hotelData as Omit<Hotel, 'id' | 'created_at' | 'updated_at'>);
      
      if (newHotel) {
        toast.success("Hotel created successfully!");
        navigate(`/hotels/${newHotel.id}`);
      } else {
        throw new Error("Failed to create hotel");
      }
    } catch (error) {
      console.error("Error creating hotel:", error);
      errorHandler.handleError(error, "CreateHotel.handleHotelSubmit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/hotels");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/hotels")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hotels
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Hotel</h1>
            <p className="text-gray-600">Add a new hotel to your inventory</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Information</CardTitle>
        </CardHeader>
        <CardContent>
          <HotelForm 
            onSubmit={handleHotelSubmit}
            onCancel={handleCancel}
            isEditing={false}
          />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              <span>Creating hotel...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateHotel;
