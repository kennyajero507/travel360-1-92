
import { RoomArrangement } from "../../../types/quote.types";

interface ArrangementSummaryProps {
  arrangement: RoomArrangement;
}

const ArrangementSummary: React.FC<ArrangementSummaryProps> = ({ arrangement }) => {
  return (
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
  );
};

export default ArrangementSummary;
