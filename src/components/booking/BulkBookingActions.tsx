import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { Booking } from "../../types/booking.types";
import { enhancedBookingService } from "../../services/enhancedBookingService";

interface BulkBookingActionsProps {
  bookings: Booking[];
  selectedBookings: string[];
  onSelectionChange: (selected: string[]) => void;
  onRefresh: () => void;
}

// Fix usage of enhancedBookingService methods so no arguments are missing/extra

const BulkBookingActions = ({
  bookings,
  selectedBookings,
  onSelectionChange,
  onRefresh,
}: any) => {
  const [loading, setLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(bookings.map(booking => booking.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedBookings.length === 0) return;
    await enhancedBookingService.bulkUpdateStatus(selectedBookings, status);
    onRefresh();
  };

  const handleBulkDelete = async () => {
    if (selectedBookings.length === 0) return;
    await enhancedBookingService.bulkDelete(selectedBookings);
    onRefresh();
  };

  return (
    <div className="flex items-center justify-between">
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
          Select All
        </label>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
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
