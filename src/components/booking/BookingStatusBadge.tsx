
import { Badge } from "../ui/badge";
import { BookingStatus } from "../../types/booking.types";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const statusClass = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-300",
  confirmed: "bg-green-50 text-green-700 border-green-300",
  cancelled: "bg-red-50 text-red-700 border-red-300",
  completed: "bg-blue-50 text-blue-700 border-blue-300",
};

export const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => {
  return (
    <Badge variant="outline" className={statusClass[status] || ""}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
