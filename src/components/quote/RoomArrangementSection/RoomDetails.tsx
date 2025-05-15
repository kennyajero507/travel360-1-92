
import { Input } from "../../ui/input";
import { RoomArrangement } from "../../../types/quote.types";

interface RoomDetailsProps {
  arrangement: RoomArrangement;
  onUpdate: (id: string, field: string, value: any) => void;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({ arrangement, onUpdate }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Adults</label>
        <Input
          type="number"
          min="0"
          value={arrangement.adults}
          onChange={(e) => onUpdate(arrangement.id, "adults", parseInt(e.target.value) || 0)}
          className="bg-white text-black"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Child with Bed</label>
        <Input
          type="number"
          min="0"
          value={arrangement.childrenWithBed}
          onChange={(e) => onUpdate(arrangement.id, "childrenWithBed", parseInt(e.target.value) || 0)}
          className="bg-white text-black"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Child No Bed</label>
        <Input
          type="number"
          min="0"
          value={arrangement.childrenNoBed}
          onChange={(e) => onUpdate(arrangement.id, "childrenNoBed", parseInt(e.target.value) || 0)}
          className="bg-white text-black"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Infants</label>
        <Input
          type="number"
          min="0"
          value={arrangement.infants}
          onChange={(e) => onUpdate(arrangement.id, "infants", parseInt(e.target.value) || 0)}
          className="bg-white text-black"
        />
      </div>
    </div>
  );
};

export default RoomDetails;
