
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useHotelsData } from "../hooks/useHotelsData";
import HotelForm from "../components/HotelForm";
import { Hotel } from "../types/hotel.types";

const EditHotel = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const { hotels, updateHotel } = useHotelsData();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hotelId && hotels.length > 0) {
      const foundHotel = hotels.find(h => h.id === hotelId);
      if (foundHotel) {
        // Ensure all required properties are present
        const completeHotel: Hotel = {
          id: foundHotel.id,
          name: foundHotel.name,
          address: foundHotel.address || "",
          destination: foundHotel.destination,
          category: foundHotel.category,
          status: foundHotel.status || "Active",
          description: foundHotel.description,
          contact_info: foundHotel.contact_info || {},
          amenities: foundHotel.amenities || [],
          room_types: foundHotel.room_types || [],
          policies: foundHotel.policies,
          pricing: foundHotel.pricing,
          images: foundHotel.images,
          additional_details: foundHotel.additional_details,
          location: foundHotel.location,
          created_at: foundHotel.created_at,
          updated_at: foundHotel.updated_at,
          org_id: foundHotel.org_id,
          created_by: foundHotel.created_by
        };
        setHotel(completeHotel);
      }
      setLoading(false);
    }
  }, [hotelId, hotels]);

  const handleSubmit = async (hotelData: Partial<Hotel>) => {
    if (!hotel) return;
    
    try {
      await updateHotel(hotel.id, hotelData);
      navigate(`/hotel-details/${hotel.id}`);
    } catch (error) {
      console.error("Error updating hotel:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hotel Not Found</h2>
        <p className="text-gray-600 mb-6">The hotel you're trying to edit doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/hotels")}>
          Back to Hotels
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Hotel</h1>
          <p className="text-gray-600">Update hotel information and settings</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/hotels")}>
          Cancel
        </Button>
      </div>

      <HotelForm 
        initialData={hotel}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/hotels")}
        isEditing={true}
      />
    </div>
  );
};

export default EditHotel;
