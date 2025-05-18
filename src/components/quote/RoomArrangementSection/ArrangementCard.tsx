
import { BedDouble, Minus } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { RoomArrangement } from "../../../types/quote.types";
import RoomDetails from "./RoomDetails";
import RateInputs from "./RateInputs";
import ArrangementSummary from "./ArrangementSummary";

interface ArrangementCardProps {
  arrangement: RoomArrangement;
  index: number;
  roomTypeMaxOccupancy: Record<string, number>;
  availableRoomTypes: string[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: any) => void;
}

const ArrangementCard: React.FC<ArrangementCardProps> = ({
  arrangement,
  index,
  roomTypeMaxOccupancy,
  availableRoomTypes,
  onRemove,
  onUpdate
}) => {
  // Make sure we have at least one valid room type
  const validRoomTypes = availableRoomTypes.filter(type => type && type.trim() !== "");
  
  if (validRoomTypes.length === 0) {
    validRoomTypes.push("Standard Room");
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center text-sm font-medium">
          <BedDouble className="h-4 w-4 mr-2" />
          Room Arrangement {index + 1}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(arrangement.id)}
          className="text-red-600"
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Room Type</label>
          <Select
            value={arrangement.roomType || validRoomTypes[0]}
            onValueChange={(value) => onUpdate(arrangement.id, "roomType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              {validRoomTypes.map((type, idx) => (
                <SelectItem key={`room-type-${idx}`} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Number of Rooms</label>
          <Input
            type="number"
            min="1"
            value={arrangement.numRooms}
            onChange={(e) => onUpdate(arrangement.id, "numRooms", parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
      
      <RoomDetails 
        arrangement={arrangement}
        onUpdate={onUpdate}
      />
      
      <RateInputs 
        arrangement={arrangement}
        onUpdate={onUpdate}
      />
      
      <ArrangementSummary arrangement={arrangement} />
    </div>
  );
};

export default ArrangementCard;
