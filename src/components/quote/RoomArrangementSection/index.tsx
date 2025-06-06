
import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Plus } from "lucide-react";
import { toast } from "../../ui/use-toast";
import { RoomArrangement, PersonTypeRates } from "../../../types/quote.types";
import TotalSummary from "./TotalSummary";
import ArrangementCard from "./ArrangementCard";

interface RoomArrangementSectionProps {
  roomArrangements: RoomArrangement[];
  duration: number;
  onRoomArrangementsChange: (arrangements: RoomArrangement[]) => void;
  availableRoomTypes: string[];
  hotelId?: string;
}

// Define default rates for new room arrangements
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

const RoomArrangementSection = ({
  roomArrangements,
  duration,
  onRoomArrangementsChange,
  availableRoomTypes,
  hotelId
}: RoomArrangementSectionProps) => {
  const [arrangements, setArrangements] = useState<RoomArrangement[]>(roomArrangements);

  useEffect(() => {
    setArrangements(roomArrangements);
  }, [roomArrangements]);

  useEffect(() => {
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
    const newId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newArrangement: RoomArrangement = {
      id: newId,
      hotel_id: hotelId || "",
      room_type: availableRoomTypes[0] || "Double Room",
      num_rooms: 1,
      adults: 2,
      children_with_bed: 0,
      children_no_bed: 0,
      infants: 0,
      rate_per_night: { ...defaultRates },
      nights: duration,
      total: 0
    };
    
    newArrangement.total = calculateRoomTotal(newArrangement, duration);
    
    const updatedArrangements = [...arrangements, newArrangement];
    setArrangements(updatedArrangements);
    onRoomArrangementsChange(updatedArrangements);
  };

  const removeArrangement = (id: string) => {
    if (arrangements.length === 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must have at least one room arrangement"
      });
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
            toast({
              title: "Occupancy Adjusted",
              description: `Adjusted occupancy to match ${value} capacity`
            });
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
            toast({
              variant: "destructive",
              title: "Error",
              description: `Maximum occupancy for ${updatedArr.room_type} is ${maxOccupancy}`
            });
            return arr;
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
        childrenWithBed: total.childrenWithBed + arr.children_with_bed * arr.num_rooms,
        childrenNoBed: total.childrenNoBed + arr.children_no_bed * arr.num_rooms,
        infants: total.infants + arr.infants * arr.num_rooms
      }),
      { adults: 0, childrenWithBed: 0, childrenNoBed: 0, infants: 0 }
    );
  };

  const totalGuests = calculateTotalGuests();
  const totalAmount = arrangements.reduce((sum, arr) => sum + arr.total, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Room Arrangement Details</h3>
        <Button onClick={addArrangement}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room Arrangement
        </Button>
      </div>
      
      <div className="space-y-4 mb-6">
        {arrangements.map((arrangement, index) => (
          <ArrangementCard 
            key={arrangement.id}
            arrangement={arrangement}
            index={index}
            roomTypeMaxOccupancy={roomTypeMaxOccupancy}
            availableRoomTypes={availableRoomTypes}
            onRemove={removeArrangement}
            onUpdate={updateArrangement}
          />
        ))}
      </div>
      
      <TotalSummary totalGuests={totalGuests} totalAmount={totalAmount} />
    </div>
  );
};

export default RoomArrangementSection;
