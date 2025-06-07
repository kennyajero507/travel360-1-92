
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useHotelsData } from '../../hooks/useHotelsData';
import { Hotel } from '../../types/hotel.types';
import { MapPin, Star, Plus, X } from 'lucide-react';

interface MultiHotelSelectorProps {
  selectedHotels: Hotel[];
  onHotelsChange: (hotels: Hotel[]) => void;
  maxSelections?: number;
}

const MultiHotelSelector: React.FC<MultiHotelSelectorProps> = ({
  selectedHotels,
  onHotelsChange,
  maxSelections = 3
}) => {
  const { hotels, isLoading } = useHotelsData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleHotelSelect = (hotel: Hotel) => {
    if (selectedHotels.length >= maxSelections) {
      return;
    }
    
    if (!selectedHotels.find(h => h.id === hotel.id)) {
      onHotelsChange([...selectedHotels, hotel]);
    }
  };

  const handleHotelRemove = (hotelId: string) => {
    onHotelsChange(selectedHotels.filter(h => h.id !== hotelId));
  };

  if (isLoading) return <div>Loading hotels...</div>;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="hotel-search">Search Hotels</Label>
        <Input
          id="hotel-search"
          placeholder="Search by hotel name or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {selectedHotels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selected Hotels ({selectedHotels.length}/{maxSelections})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedHotels.map((hotel) => (
                <div key={hotel.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="font-medium">{hotel.name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {hotel.destination}
                      </p>
                    </div>
                    <Badge variant="secondary">{hotel.category}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHotelRemove(hotel.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Hotels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredHotels
              .filter(hotel => !selectedHotels.find(h => h.id === hotel.id))
              .map((hotel) => (
                <div key={hotel.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="font-medium">{hotel.name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {hotel.destination}
                      </p>
                    </div>
                    <Badge variant="secondary">{hotel.category}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHotelSelect(hotel)}
                    disabled={selectedHotels.length >= maxSelections}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiHotelSelector;
