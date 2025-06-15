
import { TableRow, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { CalendarClock, CheckCircle, FileText, Mail } from "lucide-react";
import { Booking, BookingStatus } from "../../types/booking.types";
import { BookingStatusBadge } from "./BookingStatusBadge";

interface BookingTableRowProps {
  booking: Booking;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onView: () => void;
  onStatusUpdate: (status: BookingStatus) => void;
  onVoucher: () => void;
}

export const BookingTableRow = ({
  booking,
  selected,
  onSelect,
  onView,
  onStatusUpdate,
  onVoucher,
}: BookingTableRowProps) => {
  return (
    <TableRow key={booking.id}>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
        />
      </TableCell>
      <TableCell className="font-medium">
        {booking.booking_reference}
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{booking.client}</div>
          {booking.client_email && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {booking.client_email}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>{booking.hotel_name}</TableCell>
      <TableCell>
        {new Date(booking.travel_start).toLocaleDateString()} - {new Date(booking.travel_end).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <BookingStatusBadge status={booking.status} />
      </TableCell>
      <TableCell>${booking.total_price.toFixed(2)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
          >
            View
          </Button>
          {booking.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              className="border-green-300 hover:bg-green-50 text-green-700"
              onClick={() => onStatusUpdate('confirmed')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirm
            </Button>
          )}

          {booking.status === 'confirmed' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onVoucher}
              >
                <FileText className="h-4 w-4 mr-1" />
                Voucher
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 hover:bg-blue-50 text-blue-700"
                onClick={() => onStatusUpdate('completed')}
              >
                <CalendarClock className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
