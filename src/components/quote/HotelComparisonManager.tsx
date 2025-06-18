
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Building, Plus, X, Check } from 'lucide-react';
import CurrencyDisplay from './CurrencyDisplay';

interface HotelOption {
  id: string;
  name: string;
  category: string;
  roomType: string;
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  rooms: number;
  isSelected?: boolean;
}

interface HotelComparisonManagerProps {
  isComparisonMode: boolean;
  hotelOptions: HotelOption[];
  onAddHotel: (hotel: HotelOption) => void;
  onRemoveHotel: (hotelId: string) => void;
  onSelectHotel: (hotelId: string) => void;
  currencyCode: string;
}

const HotelComparisonManager: React.FC<HotelComparisonManagerProps> = ({
  isComparisonMode,
  hotelOptions,
  onAddHotel,
  onRemoveHotel,
  onSelectHotel,
  currencyCode
}) => {
  const [newHotel, setNewHotel] = useState({
    name: '',
    category: '',
    roomType: '',
    pricePerNight: 0,
    nights: 1,
    rooms: 1
  });

  const handleAddHotel = () => {
    if (newHotel.name && newHotel.pricePerNight > 0) {
      const hotel: HotelOption = {
        id: Date.now().toString(),
        ...newHotel,
        totalPrice: newHotel.pricePerNight * newHotel.nights * newHotel.rooms
      };
      onAddHotel(hotel);
      setNewHotel({
        name: '',
        category: '',
        roomType: '',
        pricePerNight: 0,
        nights: 1,
        rooms: 1
      });
    }
  };

  const categories = ['Budget', 'Standard', 'Premium', 'Luxury'];
  const roomTypes = ['Single', 'Double', 'Twin', 'Suite', 'Family Room'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {isComparisonMode ? 'Hotel Comparison' : 'Hotel Selection'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Hotel Form */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Add Hotel Option</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="hotel-name">Hotel Name</Label>
              <Input
                id="hotel-name"
                value={newHotel.name}
                onChange={(e) => setNewHotel(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Hotel name"
              />
            </div>
            <div>
              <Label htmlFor="hotel-category">Category</Label>
              <Select value={newHotel.category} onValueChange={(value) => setNewHotel(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="room-type">Room Type</Label>
              <Select value={newHotel.roomType} onValueChange={(value) => setNewHotel(prev => ({ ...prev, roomType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price-per-night">Price per Night</Label>
              <Input
                id="price-per-night"
                type="number"
                value={newHotel.pricePerNight}
                onChange={(e) => setNewHotel(prev => ({ ...prev, pricePerNight: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="nights">Nights</Label>
              <Input
                id="nights"
                type="number"
                value={newHotel.nights}
                onChange={(e) => setNewHotel(prev => ({ ...prev, nights: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="rooms">Rooms</Label>
              <Input
                id="rooms"
                type="number"
                value={newHotel.rooms}
                onChange={(e) => setNewHotel(prev => ({ ...prev, rooms: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddHotel} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Hotel
              </Button>
            </div>
          </div>
        </div>

        {/* Hotel Options List */}
        {hotelOptions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Hotel Options</h4>
            <div className="grid gap-4">
              {hotelOptions.map((hotel) => (
                <Card key={hotel.id} className={`${hotel.isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{hotel.name}</h5>
                          <Badge variant="outline">{hotel.category}</Badge>
                          {hotel.isSelected && <Badge variant="default">Selected</Badge>}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Room Type: {hotel.roomType}</p>
                          <p>Price: <CurrencyDisplay amount={hotel.pricePerNight} currencyCode={currencyCode} /> per night</p>
                          <p>{hotel.nights} nights × {hotel.rooms} rooms</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-semibold">
                            <CurrencyDisplay amount={hotel.totalPrice} currencyCode={currencyCode} />
                          </p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {isComparisonMode && !hotel.isSelected && (
                            <Button
                              size="sm"
                              onClick={() => onSelectHotel(hotel.id)}
                              variant="outline"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRemoveHotel(hotel.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HotelComparisonManager;
