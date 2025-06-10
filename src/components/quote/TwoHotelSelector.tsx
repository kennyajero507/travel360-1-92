
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Hotel, Plus, X, AlertCircle } from "lucide-react";
import HotelSelection from "./HotelSelection";

interface TwoHotelSelectorProps {
  selectedHotels: any[];
  availableHotels: any[];
  onHotelSelection: (hotelId: string) => void;
  onHotelRemove: (hotelId: string) => void;
  onRoomTypesLoaded?: (roomTypes: any[], hotelId: string) => void;
  onProceedToComparison?: () => void;
}

const TwoHotelSelector: React.FC<TwoHotelSelectorProps> = ({
  selectedHotels,
  availableHotels,
  onHotelSelection,
  onHotelRemove,
  onRoomTypesLoaded,
  onProceedToComparison
}) => {
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const maxHotels = 2;
  const canAddMore = selectedHotels.length < maxHotels;
  const isComplete = selectedHotels.length === maxHotels;

  const handleHotelSelect = (hotelId: string) => {
    if (canAddMore) {
      onHotelSelection(hotelId);
      setSelectedHotelId(null);
      
      // Load room types for this hotel
      const selectedHotel = availableHotels.find(h => h.id === hotelId);
      if (selectedHotel?.room_types && onRoomTypesLoaded) {
        onRoomTypesLoaded(selectedHotel.room_types, hotelId);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="h-5 w-5 text-blue-600" />
          Select 2 Hotels for Comparison ({selectedHotels.length}/{maxHotels})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Choose exactly 2 hotels to create a comparison quote for your client. 
            This allows clients to see options and make an informed decision.
          </AlertDescription>
        </Alert>

        {/* Selected Hotels */}
        {selectedHotels.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Selected Hotels</h3>
            <div className="space-y-2">
              {selectedHotels.map((hotel, index) => (
                <div key={hotel.id} className="flex items-center justify-between p-3 border rounded-md bg-blue-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Hotel {index + 1}</Badge>
                      <h4 className="font-medium">{hotel.name}</h4>
                      <Badge>{hotel.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{hotel.destination}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onHotelRemove(hotel.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Hotel Section */}
        {canAddMore && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-700">
                Add Hotel {selectedHotels.length + 1}
              </h3>
            </div>
            <HotelSelection
              selectedHotelId={selectedHotelId}
              hotels={availableHotels.filter(h => !selectedHotels.find(s => s.id === h.id))}
              onHotelSelection={handleHotelSelect}
              placeholder={`Select hotel ${selectedHotels.length + 1} for comparison`}
              maxHotels={maxHotels}
              selectedHotelsCount={selectedHotels.length}
            />
          </div>
        )}

        {/* Completion Status */}
        {isComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">Hotels Selected!</h4>
                <p className="text-sm text-green-600 mt-1">
                  You can now proceed to set up room arrangements and pricing for comparison.
                </p>
              </div>
              {onProceedToComparison && (
                <Button 
                  onClick={onProceedToComparison}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Setup Comparison
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Selection Progress</span>
            <span>{selectedHotels.length} of {maxHotels} hotels selected</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedHotels.length / maxHotels) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoHotelSelector;
