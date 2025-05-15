
import { useEffect } from "react";
import { Hotel } from "lucide-react";
import { Card, CardContent } from "../ui/card";
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
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Hotel className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Select Hotel</h2>
          </div>
          
          <Select value={selectedHotelId} onValueChange={onHotelSelection}>
            <SelectTrigger className="w-full bg-white text-black">
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
      </CardContent>
    </Card>
  );
};

export default HotelSelection;
