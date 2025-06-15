
import { useParams } from "react-router-dom";
import { useHotelsData } from "../hooks/useHotelsData";
import HotelRoomManagement from "../components/HotelRoomManagement";
import { Skeleton } from "@/components/ui/skeleton";

const HotelRoomManagementPage = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const { hotels, isLoading } = useHotelsData();

  if (isLoading) {
    return (
      <div className="p-10">
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-96 w-full mt-4" />
      </div>
    );
  }

  // Find hotel
  const hotel = hotels.find((h) => h.id === hotelId);

  if (!hotel) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Hotel Not Found</h2>
        <p className="text-gray-500">The hotel you're looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <HotelRoomManagement 
        hotelId={hotel.id}
        hotelName={hotel.name}
        initialRoomTypes={hotel.room_types || []}
      />
    </div>
  );
};

export default HotelRoomManagementPage;
