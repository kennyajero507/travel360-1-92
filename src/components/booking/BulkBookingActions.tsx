
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Booking, BookingStatus } from "../../types/booking.types";

interface BulkBookingActionsProps {
  bookings: Booking[];
  selectedBookings: string[];
  onSelectionChange: (selected: string[]) => void;
  onBulkStatusUpdate: (status: BookingStatus) => void;
  onBulkDelete: () => void;
}

const BulkBookingActions = ({
  bookings,
  selectedBookings,
  onSelectionChange,
  onBulkStatusUpdate,
  onBulkDelete,
}: BulkBookingActionsProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(bookings.map(booking => booking.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkStatusUpdate = (status: BookingStatus) => {
    if (selectedBookings.length > 0) {
      onBulkStatusUpdate(status);
    }
  };

  const handleBulkDelete = () => {
    if (selectedBookings.length > 0) {
      onBulkDelete();
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="select-all"
          checked={selectedBookings.length === bookings.length && bookings.length > 0}
          aria-label="Select all"
          onCheckedChange={handleSelectAll}
        />
        <label
          htmlFor="select-all"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Select All ({selectedBookings.length})
        </label>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={selectedBookings.length === 0}>
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('confirmed')}>
            Confirm Bookings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('cancelled')}>
            Cancel Bookings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkStatusUpdate('completed')}>
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBulkDelete} className="text-red-500">
            Delete Bookings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BulkBookingActions;
