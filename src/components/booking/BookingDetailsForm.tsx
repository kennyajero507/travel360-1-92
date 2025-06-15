
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface BookingDetailsFormProps {
  formData: {
    agentId: string;
    notes: string;
  };
  onFormChange: (data: { agentId: string; notes: string; }) => void;
  loading: boolean;
}

const BookingDetailsForm = ({ formData, onFormChange, loading }: BookingDetailsFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="agentId">Assigned Agent</Label>
            <Input
              id="agentId"
              value={formData.agentId}
              onChange={(e) => onFormChange({ ...formData, agentId: e.target.value })}
              placeholder="Enter agent ID (optional)"
              disabled
            />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
            placeholder="Add any additional notes for this booking..."
            rows={4}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingDetailsForm;
