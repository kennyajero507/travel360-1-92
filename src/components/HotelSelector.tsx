
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCurrency } from "../contexts/CurrencyContext";
import { Check, Trash2 } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

export interface HotelItem {
  id: string;
  name: string;
  ratePerNight: number;
  roomType: string;
  rooms: number;
  nights: number;
  total: number;
}

interface HotelSelectorProps {
  hotel: HotelItem;
  onChange: (id: string, field: keyof HotelItem, value: any) => void;
  onRemove: (id: string) => void;
  index: number;
}

// Mock hotel database
const sampleHotels = [
  { id: "serena", name: "Serena Hotel", defaultRate: 250 },
  { id: "intercontinental", name: "Intercontinental", defaultRate: 300 },
  { id: "hilton", name: "Hilton", defaultRate: 280 },
  { id: "kempinski", name: "Kempinski", defaultRate: 350 },
  { id: "sarova", name: "Sarova Stanley", defaultRate: 200 },
];

// Mock room types
const roomTypes = {
  "serena": [
    { id: "sr1", name: "Standard Room", rate: 250 },
    { id: "sr2", name: "Deluxe Room", rate: 350 },
    { id: "sr3", name: "Executive Suite", rate: 500 }
  ],
  "intercontinental": [
    { id: "ic1", name: "Classic Room", rate: 300 },
    { id: "ic2", name: "Superior Room", rate: 400 },
    { id: "ic3", name: "Club Room", rate: 550 }
  ],
  "hilton": [
    { id: "ht1", name: "Guest Room", rate: 280 },
    { id: "ht2", name: "Deluxe Room", rate: 380 },
    { id: "ht3", name: "King Suite", rate: 520 }
  ],
  "kempinski": [
    { id: "km1", name: "Superior Room", rate: 350 },
    { id: "km2", name: "Deluxe Room", rate: 450 },
    { id: "km3", name: "Executive Suite", rate: 650 }
  ],
  "sarova": [
    { id: "sv1", name: "Standard Room", rate: 200 },
    { id: "sv2", name: "Club Room", rate: 300 },
    { id: "sv3", name: "Junior Suite", rate: 400 }
  ]
};

const HotelSelector = ({ hotel, onChange, onRemove, index }: HotelSelectorProps) => {
  const { formatAmount } = useCurrency();
  const [isManualEntry, setIsManualEntry] = useState(true);
  const [availableRoomTypes, setAvailableRoomTypes] = useState<any[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  
  // Update available room types when hotel changes
  useEffect(() => {
    if (selectedHotelId && roomTypes[selectedHotelId as keyof typeof roomTypes]) {
      setAvailableRoomTypes(roomTypes[selectedHotelId as keyof typeof roomTypes]);
    } else {
      setAvailableRoomTypes([]);
    }
  }, [selectedHotelId]);
  
  const handleHotelSelection = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    const selectedHotel = sampleHotels.find(h => h.id === hotelId);
    if (selectedHotel) {
      onChange(hotel.id, "name", selectedHotel.name);
      onChange(hotel.id, "ratePerNight", selectedHotel.defaultRate);
      updateTotal(selectedHotel.defaultRate, hotel.rooms, hotel.nights);
    }
  };
  
  const handleRoomTypeSelection = (roomTypeId: string) => {
    const selectedRoomType = availableRoomTypes.find(rt => rt.id === roomTypeId);
    if (selectedRoomType) {
      onChange(hotel.id, "roomType", selectedRoomType.name);
      onChange(hotel.id, "ratePerNight", selectedRoomType.rate);
      updateTotal(selectedRoomType.rate, hotel.rooms, hotel.nights);
    }
  };
  
  const updateTotal = (rate: number, rooms: number, nights: number) => {
    onChange(hotel.id, "total", rate * rooms * nights);
  };

  const handleRateChange = (rate: number) => {
    onChange(hotel.id, "ratePerNight", rate);
    updateTotal(rate, hotel.rooms, hotel.nights);
  };

  const handleNightsChange = (nights: number) => {
    onChange(hotel.id, "nights", nights);
    updateTotal(hotel.ratePerNight, hotel.rooms, nights);
  };
  
  const handleRoomsChange = (rooms: number) => {
    onChange(hotel.id, "rooms", rooms);
    updateTotal(hotel.ratePerNight, rooms, hotel.nights);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Hotel {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(hotel.id)}
        >
          <span className="sr-only">Remove</span>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`manual-${hotel.id}`}
          checked={isManualEntry}
          onCheckedChange={(checked) => setIsManualEntry(checked === true)}
        />
        <label 
          htmlFor={`manual-${hotel.id}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Manual entry
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isManualEntry ? (
          <div className="lg:col-span-2">
            <label className="text-sm font-medium mb-2 block">Hotel Name</label>
            <Input
              value={hotel.name}
              onChange={(e) => onChange(hotel.id, "name", e.target.value)}
              placeholder="Enter hotel name"
              required
              className="bg-white text-black"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">Select Hotel</label>
              <Select onValueChange={handleHotelSelection}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Select a hotel" />
                </SelectTrigger>
                <SelectContent>
                  {sampleHotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Room Type</label>
              <Select 
                onValueChange={handleRoomTypeSelection}
                disabled={!selectedHotelId}
              >
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>{rt.name} - ${rt.rate}/night</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        
        <div>
          <label className="text-sm font-medium mb-2 block">Room Type</label>
          <Input
            value={hotel.roomType}
            onChange={(e) => onChange(hotel.id, "roomType", e.target.value)}
            placeholder="e.g. Standard, Deluxe, etc."
            className="bg-white text-black"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Rate per Night</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={hotel.ratePerNight}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            required
            className="bg-white text-black"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Number of Rooms</label>
          <Input
            type="number"
            min="1"
            value={hotel.rooms}
            onChange={(e) => handleRoomsChange(parseInt(e.target.value))}
            required
            className="bg-white text-black"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Number of Nights</label>
          <Input
            type="number"
            min="1"
            value={hotel.nights}
            onChange={(e) => handleNightsChange(parseInt(e.target.value))}
            required
            className="bg-white text-black"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <div className="bg-gray-50 p-2 rounded-md">
          <span className="text-sm font-medium">Total: {formatAmount(hotel.total)}</span>
        </div>
      </div>
    </div>
  );
};

export default HotelSelector;
