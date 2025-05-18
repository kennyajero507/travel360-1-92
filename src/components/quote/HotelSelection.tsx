
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

  return (
    <div className="w-full">
      <Select value={selectedHotelId} onValueChange={onHotelSelection}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a hotel from inventory" />
        </SelectTrigger>
        <SelectContent>
          {hotels.map(hotel => (
            <SelectItem key={hotel.id} value={hotel.id}>
              {hotel.name} - {hotel.category} ({hotel.destination})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default HotelSelection;
