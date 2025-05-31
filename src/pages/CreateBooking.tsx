
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { getQuoteById } from "../services/quoteService";
import { createBookingFromQuote } from "../services/bookingService";
import { QuoteData } from "../types/quote.types";
import LoadingIndicator from "../components/quote/LoadingIndicator";

const CreateBooking = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "partially_paid" | "pending">("pending");
  const [bookingNotes, setBookingNotes] = useState("");

  useEffect(() => {
    const loadQuote = async () => {
      if (!quoteId) return;
      
      try {
        const quoteData = await getQuoteById(quoteId);
        if (quoteData && quoteData.status === 'approved') {
          setQuote(quoteData);
          // Auto-select the approved hotel if available
          if (quoteData.approvedHotelId) {
            setSelectedHotel(quoteData.approvedHotelId);
          }
        } else {
          toast.error("Quote not found or not approved");
          navigate("/quotes");
        }
      } catch (error) {
        console.error("Error loading quote:", error);
        toast.error("Failed to load quote");
        navigate("/quotes");
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [quoteId, navigate]);

  const handleCreateBooking = async () => {
    if (!quote || !selectedHotel) {
      toast.error("Please select a hotel");
      return;
    }

    try {
      setCreating(true);
      const booking = await createBookingFromQuote(quote.id!, selectedHotel);
      if (booking) {
        toast.success(`Booking created successfully! Reference: ${booking.booking_reference}`);
        navigate(`/bookings/${booking.id}`);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading quote details..." />;
  }

  if (!quote) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Quote Not Found</h2>
            <p className="text-gray-600 mb-6">The requested quote could not be loaded or is not approved.</p>
            <Button onClick={() => navigate("/quotes")}>Back to Quotes</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unique hotels from room arrangements
  const availableHotels = quote.roomArrangements
    .filter((arrangement, index, self) => 
      arrangement.hotelId && self.findIndex(a => a.hotelId === arrangement.hotelId) === index
    )
    .map(arrangement => ({
      id: arrangement.hotelId!,
      name: `Hotel ${arrangement.hotelId}` // In real app, get actual hotel name
    }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Create Booking</h1>
          <p className="text-gray-500 mt-2">Convert approved quote to booking</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          Quote Approved
        </Badge>
      </div>

      {/* Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Client</Label>
              <p className="font-medium">{quote.client}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Destination</Label>
              <p className="font-medium">{quote.destination}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Travel Dates</Label>
              <p className="font-medium">{quote.startDate} to {quote.endDate}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Duration</Label>
              <p className="font-medium">{quote.duration.days} days, {quote.duration.nights} nights</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Adults</Label>
              <p className="font-medium">{quote.travelers.adults}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Children (with bed)</Label>
              <p className="font-medium">{quote.travelers.childrenWithBed}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Children (no bed)</Label>
              <p className="font-medium">{quote.travelers.childrenNoBed}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Infants</Label>
              <p className="font-medium">{quote.travelers.infants}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hotel">Select Hotel *</Label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose hotel for booking" />
                </SelectTrigger>
                <SelectContent>
                  {availableHotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Booking Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for this booking..."
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => navigate("/quotes")}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreateBooking}
          disabled={creating || !selectedHotel}
          className="min-w-32"
        >
          {creating ? "Creating..." : "Create Booking"}
        </Button>
      </div>
    </div>
  );
};

export default CreateBooking;
