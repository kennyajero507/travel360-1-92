
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import HotelSelection from "./HotelSelection";
import { Hotel } from "../../types/hotel.types";

interface HotelSelectionSectionProps {
  selectedHotels: Hotel[];
  availableHotels: Hotel[];
  onHotelSelection: (hotelId: string) => void;
  onHotelRemove: (hotelId: string) => void;
  onRoomTypesLoaded?: (roomTypes: any[]) => void;
  maxSelections?: number;
}

const HotelSelectionSection: React.FC<HotelSelectionSectionProps> = ({
  selectedHotels,
  availableHotels,
  onHotelSelection,
  onHotelRemove,
  onRoomTypesLoaded,
  maxSelections = 3
}) => {
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredHotels = availableHotels.filter(hotel => 
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (hotel.destination && hotel.destination.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleHotelSelect = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    onHotelSelection(hotelId);
    
    // Reset the select
    setTimeout(() => {
      setSelectedHotelId(null);
    }, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="h-5 w-5 text-blue-600" />
          Select Hotels ({selectedHotels.length}/{maxSelections})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search hotels */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search hotels by name or destination..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Selected hotels list */}
        {selectedHotels.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Selected Hotels</h3>
            <div className="space-y-2">
              {selectedHotels.map((hotel) => (
                <div key={hotel.id} className="flex items-center justify-between p-3 border rounded-md bg-blue-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{hotel.name}</h4>
                      <Badge>{hotel.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{hotel.destination}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onHotelRemove(hotel.id)}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Hotel selection dropdown */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Add Hotels</h3>
          <HotelSelection
            selectedHotelId={selectedHotelId}
            hotels={filteredHotels}
            onHotelSelection={handleHotelSelect}
            onRoomTypesLoaded={onRoomTypesLoaded}
            maxHotels={maxSelections}
            selectedHotelsCount={selectedHotels.length}
            placeholder="Select a hotel to add"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-gray-500">
          Select up to {maxSelections} hotels for this quote
        </div>
        <div className="text-sm">
          {selectedHotels.length}/{maxSelections} selected
        </div>
      </CardFooter>
    </Card>
  );
};

export default HotelSelectionSection;
