
import { useCurrency } from "../../contexts/CurrencyContext";
import { RoomType } from "../../types/hotel.types";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Plus, Bed } from "lucide-react";

interface HotelRoomListProps {
  roomTypes: RoomType[];
  selectedHotel: any;
  onAddRoom: (roomType: RoomType) => void;
}

const HotelRoomList = ({ roomTypes, selectedHotel, onAddRoom }: HotelRoomListProps) => {
  // Get currency formatting from context
  const currency = useCurrency();
  const formatAmount = currency ? currency.formatAmount : (val: number) => `$${val}`;

  if (!roomTypes || roomTypes.length === 0) {
    return (
      <div className="text-center py-4 border border-dashed border-gray-200 rounded-md">
        <p className="text-sm text-gray-500">No room types found for this hotel</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {roomTypes.map((roomType) => (
        <Card key={roomType.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-2 text-blue-600" />
              <h4 className="font-medium">{roomType.name}</h4>
            </div>
            <span className="text-sm text-gray-500">Max: {roomType.maxOccupancy} persons</span>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Bed Options:</span> {roomType.bedOptions}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Rate per Night:</span> {formatAmount(roomType.ratePerNight)}
              </p>
              {roomType.amenities && roomType.amenities.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-600">Amenities:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {roomType.amenities.slice(0, 3).map((amenity, index) => (
                      <li key={index}>{amenity}</li>
                    ))}
                    {roomType.amenities.length > 3 && (
                      <li className="text-blue-500">+ {roomType.amenities.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
              <div className="pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onAddRoom(roomType)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HotelRoomList;
