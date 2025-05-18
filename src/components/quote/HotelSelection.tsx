
import { useEffect, useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";

interface HotelSelectionProps {
  selectedHotelId: string | null;
  hotels: any[];
  onHotelSelection: (hotelId: string) => void;
  onRoomTypesLoaded?: (roomTypes: any[]) => void;
  placeholder?: string;
  isRequired?: boolean;
  maxHotels?: number;
  selectedHotelsCount?: number;
}

const HotelSelection = ({ 
  selectedHotelId, 
  hotels, 
  onHotelSelection,
  onRoomTypesLoaded,
  placeholder = "Select a hotel from inventory",
  isRequired = false,
  maxHotels,
  selectedHotelsCount = 0
}: HotelSelectionProps) => {
  const [showRequiredWarning, setShowRequiredWarning] = useState(false);
  
  // When hotel selection changes, get its room types
  useEffect(() => {
    if (selectedHotelId && hotels.length > 0) {
      const selectedHotel = hotels.find(hotel => hotel.id === selectedHotelId);
      if (selectedHotel && selectedHotel.roomTypes && selectedHotel.roomTypes.length > 0) {
        if (onRoomTypesLoaded) {
          onRoomTypesLoaded(selectedHotel.roomTypes);
        }
      }
      
      // Hide the warning when a hotel is selected
      if (isRequired) {
        setShowRequiredWarning(false);
      }
    }
  }, [selectedHotelId, hotels, onRoomTypesLoaded, isRequired]);

  // Filter out any hotel that doesn't have a valid ID
  const validHotels = hotels.filter(hotel => hotel && hotel.id);
  
  const handleFocus = () => {
    if (isRequired && !selectedHotelId) {
      setShowRequiredWarning(true);
    }
  };

  const limitReached = maxHotels !== undefined && selectedHotelsCount >= maxHotels;

  return (
    <div className="w-full space-y-2">
      {showRequiredWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a hotel before proceeding.
          </AlertDescription>
        </Alert>
      )}
      
      {limitReached && (
        <Alert>
          <AlertDescription>
            Maximum of {maxHotels} hotels can be selected for comparison.
          </AlertDescription>
        </Alert>
      )}
      
      <Select 
        value={selectedHotelId || "placeholder"} 
        onValueChange={(value) => value !== "placeholder" && onHotelSelection(value)}
        disabled={limitReached}
        onOpenChange={(open) => {
          if (open && isRequired && !selectedHotelId) {
            setShowRequiredWarning(true);
          }
        }}
      >
        <SelectTrigger 
          className={`w-full bg-white text-gray-800 border ${
            isRequired && !selectedHotelId ? 'border-red-300' : 'border-teal-200'
          } focus:ring-teal-500`}
          onFocus={handleFocus}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {/* Add a placeholder option */}
          <SelectItem value="placeholder" disabled>{placeholder}</SelectItem>
          
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
