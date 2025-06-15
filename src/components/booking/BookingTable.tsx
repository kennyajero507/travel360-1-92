
import { Table, TableHeader, TableRow, TableHead, TableBody } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Booking, BookingStatus } from "../../types/booking.types";
import { BookingTableRow } from "./BookingTableRow";

interface BookingTableProps {
  bookings: Booking[];
  selectedBookings: string[];
  onSelectBooking: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onView: (id: string) => void;
  onStatusUpdate: (id: string, status: BookingStatus) => void;
  onVoucher: (id: string) => void;
}

export const BookingTable = ({
  bookings,
  selectedBookings,
  onSelectBooking,
  onSelectAll,
  onView,
  onStatusUpdate,
  onVoucher,
}: BookingTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedBookings.length === bookings.length && bookings.length > 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Hotel</TableHead>
          <TableHead>Travel Period</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <BookingTableRow
            key={booking.id}
            booking={booking}
            selected={selectedBookings.includes(booking.id)}
            onSelect={(checked) => onSelectBooking(booking.id, !!checked)}
            onView={() => onView(booking.id)}
            onStatusUpdate={(status) => onStatusUpdate(booking.id, status)}
            onVoucher={() => onVoucher(booking.id)}
          />
        ))}
      </TableBody>
    </Table>
  );
};
