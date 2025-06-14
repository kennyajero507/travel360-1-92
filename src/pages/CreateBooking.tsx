import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { useQuoteData } from "../hooks/useQuoteData";
import { createBookingFromQuote } from "../services/bookingService";

const CreateBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quoteId');
  const { quotes } = useQuoteData();
  
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agentId: "",
    notes: ""
  });

  useEffect(() => {
    if (quoteId && quotes.length > 0) {
      const quote = quotes.find(q => q.id === quoteId);
      if (quote) {
        setSelectedQuote(quote);
        
        // Check if quote has an approved hotel
        if (!quote.approved_hotel_id) {
          toast.error("Quote must have an approved hotel before creating a booking");
          navigate('/quotes');
        }
      }
    }
  }, [quoteId, quotes, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedQuote) {
      toast.error("No quote selected");
      return;
    }

    if (!selectedQuote.approved_hotel_id) {
      toast.error("Quote must have an approved hotel");
      return;
    }

    setLoading(true);
    
    try {
      // Only pass quoteId and hotelId - all other booking data is generated in the service/backend
      const newBooking = await createBookingFromQuote(selectedQuote.id, selectedQuote.approved_hotel_id);
      
      if (newBooking) {
        toast.success("Booking created successfully");
        navigate(`/booking-details/${newBooking.id}`);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (quote: any) => {
    if (!quote) return 0;
    
    const roomTotal = quote.room_arrangements?.reduce((sum: number, room: any) => sum + (room.total || 0), 0) || 0;
    const activitiesTotal = quote.activities?.reduce((sum: number, activity: any) => sum + (activity.cost * activity.num_people || 0), 0) || 0;
    const transportTotal = quote.transports?.reduce((sum: number, transport: any) => sum + (transport.cost || 0), 0) || 0;
    const transfersTotal = quote.transfers?.reduce((sum: number, transfer: any) => sum + (transfer.cost || 0), 0) || 0;
    
    const subtotal = roomTotal + activitiesTotal + transportTotal + transfersTotal;
    const markupValue = quote.markup_value || 0;
    const markupType = quote.markup_type || "percentage";
    
    let markup = 0;
    if (markupType === "percentage") {
      markup = (subtotal * markupValue) / 100;
    } else {
      markup = markupValue;
    }
    
    return subtotal + markup;
  };

  if (!selectedQuote) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Quote...</h2>
        <p className="text-gray-600">Please wait while we load the quote details.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Booking</h1>
          <p className="text-gray-600">Convert quote to confirmed booking</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/quotes')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quote Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Client</Label>
                <p className="text-gray-900">{selectedQuote.client}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Destination</Label>
                <p className="text-gray-900">{selectedQuote.destination}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Travel Dates</Label>
                <p className="text-gray-900">
                  {new Date(selectedQuote.start_date).toLocaleDateString()} - {new Date(selectedQuote.end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Duration</Label>
                <p className="text-gray-900">{selectedQuote.duration_nights} nights, {selectedQuote.duration_days} days</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Adults</Label>
                <p className="text-gray-900">{selectedQuote.adults}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Children with Bed</Label>
                <p className="text-gray-900">{selectedQuote.children_with_bed}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Children no Bed</Label>
                <p className="text-gray-900">{selectedQuote.children_no_bed}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Infants</Label>
                <p className="text-gray-900">{selectedQuote.infants}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Amount</span>
                <span className="text-xl font-bold text-teal-600">
                  ${calculateTotalPrice(selectedQuote).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
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
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  placeholder="Enter agent ID (optional)"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes for this booking..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/quotes')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBooking;
