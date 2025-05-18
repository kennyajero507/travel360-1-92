
import { useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";

interface HotelSelectionProps {
  selectedHotelId: string;
  hotels: any[];
  onHotelSelection: (hotelId: string) => void;
  onRoomTypesLoaded?: (roomTypes: any[]) => void;
}

const HotelSelection = ({ 
  selectedHotelId, 
  hotels, 
  onHotelSelection,
  onRoomTypesLoaded
}: HotelSelectionProps) => {
  // When hotel selection changes, get its room types
  useEffect(() => {
    if (selectedHotelId && hotels.length > 0) {
      const selectedHotel = hotels.find(hotel => hotel.id === selectedHotelId);
      if (selectedHotel && selectedHotel.roomTypes && selectedHotel.roomTypes.length > 0) {
        if (onRoomTypesLoaded) {
          onRoomTypesLoaded(selectedHotel.roomTypes);
        }
      }
    }
  }, [selectedHotelId, hotels, onRoomTypesLoaded]);

  // Filter out any hotel that doesn't have a valid ID
  const validHotels = hotels.filter(hotel => hotel && hotel.id);

  return (
    <div className="w-full">
      <Select value={selectedHotelId || "placeholder"} onValueChange={onHotelSelection}>
        <SelectTrigger className="w-full bg-white text-gray-800 border border-teal-200 focus:ring-teal-500">
          <SelectValue placeholder="Select a hotel from inventory" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {/* Add a placeholder option */}
          <SelectItem value="placeholder" disabled>Select a hotel from inventory</SelectItem>
          
          {validHotels.map(hotel => {
            // Ensure we have a valid ID string that's never empty
            const safeId = hotel.id ? String(hotel.id) : `hotel-${Date.now()}-${Math.random()}`;
            const displayName = hotel.name || "Unnamed Hotel";
            const category = hotel.category || "";
            const destination = hotel.destination || "";
            
            return (
              <SelectItem key={safeId} value={safeId}>
                {displayName} {category && `- ${category}`} {destination && `(${destination})`}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default HotelSelection;
