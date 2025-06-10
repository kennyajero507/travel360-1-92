
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Search, Building, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import TwoHotelSelector from "./TwoHotelSelector";
import { Hotel } from "../../types/hotel.types";

interface HotelSelectionSectionProps {
  selectedHotels: Hotel[];
  availableHotels: Hotel[];
  onHotelSelection: (hotelId: string) => void;
  onHotelRemove: (hotelId: string) => void;
  onRoomTypesLoaded?: (roomTypes: any[], hotelId: string) => void;
  onProceedToComparison?: () => void;
}

const HotelSelectionSection: React.FC<HotelSelectionSectionProps> = ({
  selectedHotels,
  availableHotels,
  onHotelSelection,
  onHotelRemove,
  onRoomTypesLoaded,
  onProceedToComparison
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredHotels = availableHotels.filter(hotel => 
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (hotel.destination && hotel.destination.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {/* Two Hotel Selector */}
      <TwoHotelSelector
        selectedHotels={selectedHotels}
        availableHotels={filteredHotels}
        onHotelSelection={onHotelSelection}
        onHotelRemove={onHotelRemove}
        onRoomTypesLoaded={onRoomTypesLoaded}
        onProceedToComparison={onProceedToComparison}
      />

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Multi-Hotel Comparison System</h4>
              <p className="text-sm text-blue-700">
                This system allows you to create professional quote comparisons with exactly 2 hotels. 
                Clients will see clean pricing without markup details, while you maintain full visibility 
                of costs and margins in your agent view.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelSelectionSection;
