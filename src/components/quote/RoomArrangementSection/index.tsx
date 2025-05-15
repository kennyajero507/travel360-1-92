
import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Plus } from "lucide-react";
import { toast } from "../../ui/use-toast";
import { RoomArrangement, PersonTypeRates } from "../../../types/quote.types";
import ArrangementCard from "./ArrangementCard";
import TotalSummary from "./TotalSummary";

interface RoomArrangementSectionProps {
  roomArrangements: RoomArrangement[];
  duration: number;
  onRoomArrangementsChange: (arrangements: RoomArrangement[]) => void;
  availableRoomTypes: string[];
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

const RoomArrangementSection = ({
  roomArrangements,
  duration,
  onRoomArrangementsChange,
  availableRoomTypes
}: RoomArrangementSectionProps) => {
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
    const { adults, childrenWithBed, childrenNoBed, infants, ratePerNight, numRooms } = arrangement;
    
    return (
      (adults * ratePerNight.adult + 
       childrenWithBed * ratePerNight.childWithBed + 
       childrenNoBed * ratePerNight.childNoBed + 
       infants * ratePerNight.infant) * nights * numRooms
    );
  };

  const addArrangement = () => {
    const newId = `room-${Date.now()}`;
    const newArrangement: RoomArrangement = {
      id: newId,
      roomType: availableRoomTypes[0] || "Double Room",
      numRooms: 1,
      adults: 2,
      childrenWithBed: 0,
      childrenNoBed: 0,
      infants: 0,
      ratePerNight: { ...defaultRates },
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
        
        // Special handling for roomType to reset occupancy if needed
        if (field === "roomType") {
          const maxOccupancy = roomTypeMaxOccupancy[value] || 2;
          const currentOccupants = updatedArr.adults + updatedArr.childrenWithBed + updatedArr.childrenNoBed;
          
          if (currentOccupants > maxOccupancy) {
            updatedArr.adults = Math.min(updatedArr.adults, maxOccupancy);
            updatedArr.childrenWithBed = 0;
            updatedArr.childrenNoBed = 0;
            toast({
              title: "Occupancy Adjusted",
              description: `Adjusted occupancy to match ${value} capacity`
            });
          }
        }
        
        // Check occupancy after any changes to people counts
        if (["adults", "childrenWithBed", "childrenNoBed"].includes(field)) {
          const maxOccupancy = roomTypeMaxOccupancy[updatedArr.roomType] || 2;
          const currentOccupants = 
            (field === "adults" ? value : updatedArr.adults) + 
            (field === "childrenWithBed" ? value : updatedArr.childrenWithBed) + 
            (field === "childrenNoBed" ? value : updatedArr.childrenNoBed);
          
          if (currentOccupants > maxOccupancy) {
            toast({
              variant: "destructive",
              title: "Error",
              description: `Maximum occupancy for ${updatedArr.roomType} is ${maxOccupancy}`
            });
            return arr; // Return original unchanged
          }
        }
        
        // Update rates if needed
        if (field.startsWith("rate_")) {
          const rateField = field.split("_")[1] as keyof PersonTypeRates;
          updatedArr = {
            ...updatedArr,
            ratePerNight: {
              ...updatedArr.ratePerNight,
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
        adults: total.adults + arr.adults * arr.numRooms,
        childrenWithBed: total.childrenWithBed + arr.childrenWithBed * arr.numRooms,
        childrenNoBed: total.childrenNoBed + arr.childrenNoBed * arr.numRooms,
        infants: total.infants + arr.infants * arr.numRooms
      }),
      { adults: 0, childrenWithBed: 0, childrenNoBed: 0, infants: 0 }
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
        
        <TotalSummary totalGuests={totalGuests} totalAmount={totalAmount} />
      </CardContent>
    </Card>
  );
};

export default RoomArrangementSection;
