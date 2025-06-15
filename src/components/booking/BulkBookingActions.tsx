import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { enhancedBookingService } from "../../services/enhancedBookingService";
import { 
  CheckSquare, 
  Download, 
  Mail, 
  Trash2, 
  FileText,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

interface BulkBookingActionsProps {
  bookings: any[];
  selectedBookings: string[];
  onSelectionChange: (selected: string[]) => void;
  onRefresh: () => void;
}

const BulkBookingActions = ({ 
  bookings, 
  selectedBookings, 
  onSelectionChange, 
  onRefresh 
}: BulkBookingActionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSelectAll = () => {
    if (selectedBookings.length === bookings.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(bookings.map(b => b.id));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedBookings.length === 0) {
      toast.error('Please select bookings to update');
      return;
    }

    setIsUpdating(true);
    try {
      await enhancedBookingService.bulkUpdateStatus(selectedBookings, status);
      onSelectionChange([]);
      onRefresh();
      toast.success(`Updated ${selectedBookings.length} bookings to ${status}`);
    } catch (error) {
      toast.error('Failed to update bookings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (selectedBookings.length === 0) {
      toast.error('Please select bookings to export');
      return;
    }

    setIsExporting(true);
    try {
      const selectedBookingData = bookings.filter(b => selectedBookings.includes(b.id));
      await enhancedBookingService.exportBookings(selectedBookingData, format);
      toast.success(`Export completed in ${format.toUpperCase()} format`);
    } catch (error) {
      toast.error('Failed to export bookings');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount = selectedBookings.length;
  const allSelected = selectedCount === bookings.length && bookings.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Bulk Actions
            {selectedCount > 0 && (
              <Badge variant="secondary">{selectedCount} selected</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={bookings.length === 0}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* Status Update Actions */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Update Status:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('confirmed')}
              disabled={selectedCount === 0 || isUpdating}
              className="text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('completed')}
              disabled={selectedCount === 0 || isUpdating}
              className="text-blue-700 hover:bg-blue-50"
            >
              <Clock className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('cancelled')}
              disabled={selectedCount === 0 || isUpdating}
              className="text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2 border-l pl-2">
            <span className="text-sm font-medium">Export:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkExport('csv')}
              disabled={selectedCount === 0 || isExporting}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkExport('excel')}
              disabled={selectedCount === 0 || isExporting}
            >
              <FileText className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkExport('pdf')}
              disabled={selectedCount === 0 || isExporting}
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>

          {/* Communication Actions */}
          <div className="flex items-center gap-2 border-l pl-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedCount === 0}
              onClick={() => toast.info('Bulk email feature coming soon')}
            >
              <Mail className="h-4 w-4 mr-1" />
              Send Updates
            </Button>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              {selectedCount} booking{selectedCount !== 1 ? 's' : ''} selected. 
              Choose an action above to apply to all selected bookings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkBookingActions;
