
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCurrency } from "../contexts/CurrencyContext";
import { Check } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

export interface HotelItem {
  id: string;
  name: string;
  ratePerNight: number;
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

const HotelSelector = ({ hotel, onChange, onRemove, index }: HotelSelectorProps) => {
  const { formatAmount } = useCurrency();
  const [isManualEntry, setIsManualEntry] = useState(true);
  
  const handleHotelSelection = (hotelId: string) => {
    const selectedHotel = sampleHotels.find(h => h.id === hotelId);
    if (selectedHotel) {
      onChange(hotel.id, "name", selectedHotel.name);
      onChange(hotel.id, "ratePerNight", selectedHotel.defaultRate);
      updateTotal(selectedHotel.defaultRate, hotel.nights);
    }
  };
  
  const updateTotal = (rate: number, nights: number) => {
    onChange(hotel.id, "total", rate * nights);
  };

  const handleRateChange = (rate: number) => {
    onChange(hotel.id, "ratePerNight", rate);
    updateTotal(rate, hotel.nights);
  };

  const handleNightsChange = (nights: number) => {
    onChange(hotel.id, "nights", nights);
    updateTotal(hotel.ratePerNight, nights);
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M5 12h14"></path>
          </svg>
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
            />
          </div>
        ) : (
          <div className="lg:col-span-2">
            <label className="text-sm font-medium mb-2 block">Select Hotel</label>
            <Select onValueChange={handleHotelSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Select a hotel" />
              </SelectTrigger>
              <SelectContent>
                {sampleHotels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <label className="text-sm font-medium mb-2 block">Rate per Night</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={hotel.ratePerNight}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Nights</label>
          <Input
            type="number"
            min="1"
            value={hotel.nights}
            onChange={(e) => handleNightsChange(parseInt(e.target.value))}
            required
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
