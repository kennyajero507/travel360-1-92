
import { Input } from "../../ui/input";
import { RoomArrangement } from "../../../types/quote.types";

interface RateInputsProps {
  arrangement: RoomArrangement;
  onUpdate: (id: string, field: string, value: any) => void;
}

const RateInputs: React.FC<RateInputsProps> = ({ arrangement, onUpdate }) => {
  return (
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
            onChange={(e) => onUpdate(arrangement.id, "rate_adult", parseFloat(e.target.value) || 0)}
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
            onChange={(e) => onUpdate(arrangement.id, "rate_childWithBed", parseFloat(e.target.value) || 0)}
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
            onChange={(e) => onUpdate(arrangement.id, "rate_childNoBed", parseFloat(e.target.value) || 0)}
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
            onChange={(e) => onUpdate(arrangement.id, "rate_infant", parseFloat(e.target.value) || 0)}
            className="bg-white text-black"
          />
        </div>
      </div>
    </div>
  );
};

export default RateInputs;
