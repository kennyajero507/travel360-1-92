
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, MapPin, Star, Users } from "lucide-react";

interface HotelSelectionProps {
  selectedHotelId: string | null;
  hotels: any[];
  onHotelSelection: (hotelId: string) => void;
  placeholder?: string;
  maxHotels?: number;
  selectedHotelsCount?: number;
}

const HotelSelection: React.FC<HotelSelectionProps> = ({
  selectedHotelId,
  hotels = [], // Default to empty array
  onHotelSelection,
  placeholder = "Select a hotel",
  maxHotels = 2,
  selectedHotelsCount = 0
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  // Safely filter hotels with null checks
  const filteredHotels = Array.isArray(hotels) ? hotels.filter(hotel =>
    hotel && hotel.name && hotel.destination && hotel.category &&
    (hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const selectedHotel = Array.isArray(hotels) ? hotels.find(h => h.id === selectedHotelId) : null;

  return (
    <div className="relative">
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowOptions(true);
            }}
            onFocus={() => setShowOptions(true)}
            className="pl-9"
          />
        </div>

        {selectedHotel && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium text-blue-800">{selectedHotel.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-blue-600">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{selectedHotel.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{selectedHotel.destination}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className="bg-blue-600">Selected</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showOptions && searchTerm && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
          {filteredHotels.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hotels found matching your search</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredHotels.map(hotel => (
                <button
                  key={hotel.id}
                  onClick={() => {
                    onHotelSelection(hotel.id);
                    setSearchTerm("");
                    setShowOptions(false);
                  }}
                  disabled={selectedHotelsCount >= maxHotels && !selectedHotelId}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-md border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{hotel.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>{hotel.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{hotel.destination}</span>
                        </div>
                        {hotel.room_types && Array.isArray(hotel.room_types) && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{hotel.room_types.length} room types</span>
                          </div>
                        )}
                      </div>
                      {hotel.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {hotel.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-3">
                      <Button size="sm" variant="outline">
                        Select
                      </Button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

export default HotelSelection;
