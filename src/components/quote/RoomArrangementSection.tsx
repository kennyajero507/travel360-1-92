
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Minus, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { RoomArrangement, PersonTypeRates } from "../../types/quote.types";

interface RoomArrangementSectionProps {
  roomArrangements: RoomArrangement[];
  duration: number;
  onRoomArrangementsChange: (arrangements: RoomArrangement[]) => void;
  availableRoomTypes: string[];
  hotelId?: string;
}

const defaultRates: PersonTypeRates = {
  adult: 80,
  childWithBed: 60,
  childNoBed: 40,
  infant: 0
};

// Max occupancy per room type
const roomTypeMaxOccupancy: Record<string, number> = {
  "Single Room": 1,
  "Double Room": 2,
  "Twin Room": 2,
  "Triple Room": 3,
  "Quad Room": 4,
  "Family Room": 6
};

const RoomArrangementSection: React.FC<RoomArrangementSectionProps> = ({
  roomArrangements,
  duration,
  onRoomArrangementsChange,
  availableRoomTypes,
  hotelId
}) => {
  const [arrangements, setArrangements] = useState<RoomArrangement[]>(roomArrangements);

  useEffect(() => {
    // Update totals when duration changes
    const updatedArrangements = arrangements.map(arrangement => ({
      ...arrangement,
      nights: duration,
      total: calculateRoomTotal(arrangement, duration)
    }));
    setArrangements(updatedArrangements);
    onRoomArrangementsChange(updatedArrangements);
  }, [duration]);

  const calculateRoomTotal = (arrangement: RoomArrangement, nights: number): number => {
    const { adults, children_with_bed, children_no_bed, infants, rate_per_night, num_rooms } = arrangement;
    
    return (
      (adults * rate_per_night.adult + 
       children_with_bed * rate_per_night.childWithBed + 
       children_no_bed * rate_per_night.childNoBed + 
       infants * rate_per_night.infant) * nights * num_rooms
    );
  };

  const addArrangement = () => {
    const newId = `room-${Date.now()}`;
    const defaultRoomType = availableRoomTypes && availableRoomTypes.length > 0 
      ? availableRoomTypes[0] 
      : "Double Room";
      
    const newArrangement: RoomArrangement = {
      id: newId,
      hotel_id: hotelId || "",
      room_type: defaultRoomType,
      num_rooms: 1,
      adults: 2,
      children_with_bed: 0,
      children_no_bed: 0,
      infants: 0,
      rate_per_night: { ...defaultRates },
      nights: duration,
      total: 0
    };
    
    // Calculate the initial total
    newArrangement.total = calculateRoomTotal(newArrangement, duration);
    
    const updatedArrangements = [...arrangements, newArrangement];
    setArrangements(updatedArrangements);
    onRoomArrangementsChange(updatedArrangements);
  };

  const removeArrangement = (id: string) => {
    if (arrangements.length === 1) {
      toast.error("You must have at least one room arrangement");
      return;
    }
    
    const updatedArrangements = arrangements.filter(arr => arr.id !== id);
    setArrangements(updatedArrangements);
    onRoomArrangementsChange(updatedArrangements);
  };

  const updateArrangement = (id: string, field: string, value: any) => {
    const updatedArrangements = arrangements.map(arr => {
      if (arr.id === id) {
        let updatedArr = { ...arr, [field]: value };
        
        // Special handling for room_type to reset occupancy if needed
        if (field === "room_type") {
          const maxOccupancy = roomTypeMaxOccupancy[value] || 2;
          const currentOccupants = updatedArr.adults + updatedArr.children_with_bed + updatedArr.children_no_bed;
          
          if (currentOccupants > maxOccupancy) {
            updatedArr.adults = Math.min(updatedArr.adults, maxOccupancy);
            updatedArr.children_with_bed = 0;
            updatedArr.children_no_bed = 0;
            toast.info(`Adjusted occupancy to match ${value} capacity`);
          }
        }
        
        // Check occupancy after any changes to people counts
        if (["adults", "children_with_bed", "children_no_bed"].includes(field)) {
          const maxOccupancy = roomTypeMaxOccupancy[updatedArr.room_type] || 2;
          const currentOccupants = 
            (field === "adults" ? value : updatedArr.adults) + 
            (field === "children_with_bed" ? value : updatedArr.children_with_bed) + 
            (field === "children_no_bed" ? value : updatedArr.children_no_bed);
          
          if (currentOccupants > maxOccupancy) {
            toast.error(`Maximum occupancy for ${updatedArr.room_type} is ${maxOccupancy}`);
            return arr; // Return original unchanged
          }
        }
        
        // Update rates if needed
        if (field.startsWith("rate_")) {
          const rateField = field.split("_")[1] as keyof PersonTypeRates;
          updatedArr = {
            ...updatedArr,
            rate_per_night: {
              ...updatedArr.rate_per_night,
              [rateField]: value
            }
          };
        }
        
        // Recalculate total
        updatedArr.total = calculateRoomTotal(updatedArr, updatedArr.nights);
        return updatedArr;
      }
      return arr;
    });
    
    setArrangements(updatedArrangements);
    onRoomArrangementsChange(updatedArrangements);
  };

  const calculateTotalGuests = () => {
    return arrangements.reduce(
      (total, arr) => ({
        adults: total.adults + arr.adults * arr.num_rooms,
        children_with_bed: total.children_with_bed + arr.children_with_bed * arr.num_rooms,
        children_no_bed: total.children_no_bed + arr.children_no_bed * arr.num_rooms,
        infants: total.infants + arr.infants * arr.num_rooms
      }),
      { adults: 0, children_with_bed: 0, children_no_bed: 0, infants: 0 }
    );
  };

  const totalGuests = calculateTotalGuests();
  const totalAmount = arrangements.reduce((sum, arr) => sum + arr.total, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Room Arrangements & Per Person Pricing</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addArrangement}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room Arrangement
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {arrangements.map((arrangement, index) => (
          <div key={arrangement.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center text-sm font-medium">
                <BedDouble className="h-4 w-4 mr-2" />
                Room Arrangement {index + 1}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrangement(arrangement.id)}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Room Type</label>
                <Select
                  value={arrangement.room_type}
                  onValueChange={(value) => updateArrangement(arrangement.id, "room_type", value)}
                >
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoomTypes.map((type, idx) => {
                      // Ensure we have a valid room type string that's never empty
                      const safeType = type || `room-type-${idx}`;
                      return (
                        <SelectItem key={idx} value={safeType}>{safeType}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Number of Rooms</label>
                <Input
                  type="number"
                  min="1"
                  value={arrangement.num_rooms}
                  onChange={(e) => updateArrangement(arrangement.id, "num_rooms", parseInt(e.target.value) || 1)}
                  className="bg-white text-black"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Adults</label>
                <Input
                  type="number"
                  min="0"
                  value={arrangement.adults}
                  onChange={(e) => updateArrangement(arrangement.id, "adults", parseInt(e.target.value) || 0)}
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Child with Bed</label>
                <Input
                  type="number"
                  min="0"
                  value={arrangement.children_with_bed}
                  onChange={(e) => updateArrangement(arrangement.id, "children_with_bed", parseInt(e.target.value) || 0)}
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Child No Bed</label>
                <Input
                  type="number"
                  min="0"
                  value={arrangement.children_no_bed}
                  onChange={(e) => updateArrangement(arrangement.id, "children_no_bed", parseInt(e.target.value) || 0)}
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Infants</label>
                <Input
                  type="number"
                  min="0"
                  value={arrangement.infants}
                  onChange={(e) => updateArrangement(arrangement.id, "infants", parseInt(e.target.value) || 0)}
                  className="bg-white text-black"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <h5 className="text-sm font-medium mb-2">Per Person Rates (per night)</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Adult Rate</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={arrangement.rate_per_night.adult}
                    onChange={(e) => updateArrangement(arrangement.id, "rate_adult", parseFloat(e.target.value) || 0)}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">CWB Rate</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={arrangement.rate_per_night.childWithBed}
                    onChange={(e) => updateArrangement(arrangement.id, "rate_childWithBed", parseFloat(e.target.value) || 0)}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">CNB Rate</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={arrangement.rate_per_night.childNoBed}
                    onChange={(e) => updateArrangement(arrangement.id, "rate_childNoBed", parseFloat(e.target.value) || 0)}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Infant Rate</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={arrangement.rate_per_night.infant}
                    onChange={(e) => updateArrangement(arrangement.id, "rate_infant", parseFloat(e.target.value) || 0)}
                    className="bg-white text-black"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-2 p-2 bg-gray-50 rounded-md flex justify-between items-center">
              <span className="text-sm">
                {arrangement.num_rooms} × {arrangement.room_type} × {arrangement.nights} nights 
                ({arrangement.adults} adults
                {arrangement.children_with_bed > 0 ? `, ${arrangement.children_with_bed} CWB` : ""}
                {arrangement.children_no_bed > 0 ? `, ${arrangement.children_no_bed} CNB` : ""}
                {arrangement.infants > 0 ? `, ${arrangement.infants} infants` : ""})
              </span>
              <span className="font-medium">${arrangement.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="flex justify-between items-center text-blue-800">
            <div>
              <p className="font-medium">Total Guests:</p>
              <p className="text-sm">
                {totalGuests.adults} Adults
                {totalGuests.children_with_bed > 0 ? `, ${totalGuests.children_with_bed} Child with Bed` : ""}
                {totalGuests.children_no_bed > 0 ? `, ${totalGuests.children_no_bed} Child No Bed` : ""}
                {totalGuests.infants > 0 ? `, ${totalGuests.infants} Infants` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">Total Amount:</p>
              <p className="text-lg">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomArrangementSection;
