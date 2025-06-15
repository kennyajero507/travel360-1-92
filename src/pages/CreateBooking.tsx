
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useQuoteData } from "../hooks/useQuoteData";
import { QuoteData } from "../types/quote.types";
import { useBookingData } from "../hooks/useBookingData";
import { useHotelsData } from "../hooks/useHotelsData";
import { Booking, RoomArrangement, BookingTransport, BookingActivity, BookingTransfer } from "../types/booking.types";
import QuoteSummaryCard from "../components/booking/QuoteSummaryCard";
import BookingDetailsForm from "../components/booking/BookingDetailsForm";
import BookingLoading from "../components/booking/BookingLoading";
import { useAuth } from "../contexts/AuthContext";

const CreateBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quoteId');
  const { quotes } = useQuoteData();
  const { createBooking } = useBookingData();
  const { hotels } = useHotelsData();
  const { profile } = useAuth();

  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agentId: "",
    notes: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({ ...prev, agentId: profile.id }));
    }
  }, [profile]);

  useEffect(() => {
    const quotesArray = Array.isArray(quotes) ? quotes : [];
    if (quoteId && quotesArray.length > 0) {
      const quote = quotesArray.find(q => q.id === quoteId);
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
    if (!selectedQuote || !selectedQuote.approved_hotel_id) {
        toast.error("No selected quote or approved hotel.");
        return;
    }
    setLoading(true);

    const approvedHotel = hotels.find(h => h.id === selectedQuote.approved_hotel_id);

    const mappedRoomArrangements: RoomArrangement[] = selectedQuote.room_arrangements.map(room => ({
      room_type: room.room_type,
      adults: room.adults,
      children_with_bed: room.children_with_bed,
      children_no_bed: room.children_no_bed,
      infants: room.infants,
      num_rooms: room.num_rooms,
      total: room.total,
    }));

    const mappedTransports: BookingTransport[] = selectedQuote.transports.map(transport => ({
      mode: transport.type,
      route: `${transport.from} to ${transport.to}`,
      operator: transport.provider,
      cost_per_person: transport.cost_per_person,
      num_passengers: transport.num_passengers,
      total_cost: transport.total_cost,
      description: transport.description,
      notes: transport.notes,
    }));

    const mappedActivities: BookingActivity[] = selectedQuote.activities.map(activity => ({
      name: activity.name,
      description: activity.description,
      date: activity.date,
      cost_per_person: activity.cost_per_person,
      num_people: activity.num_people,
      total_cost: activity.total_cost,
    }));

    const mappedTransfers: BookingTransfer[] = selectedQuote.transfers.map(transfer => ({
      type: transfer.type,
      from: transfer.from,
      to: transfer.to,
      vehicle_type: transfer.vehicle_type,
      cost_per_vehicle: transfer.cost_per_vehicle,
      num_vehicles: transfer.num_vehicles,
      total: transfer.total,
      description: transfer.description,
    }));

    const bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'> = {
        booking_reference: `BKG-${Date.now().toString().slice(-6)}`,
        client: selectedQuote.client,
        hotel_name: approvedHotel?.name || 'Approved Hotel',
        hotel_id: selectedQuote.approved_hotel_id,
        agent_id: formData.agentId || undefined,
        travel_start: selectedQuote.start_date,
        travel_end: selectedQuote.end_date,
        room_arrangement: mappedRoomArrangements,
        transport: mappedTransports,
        activities: mappedActivities,
        transfers: mappedTransfers,
        status: 'pending',
        total_price: calculateTotalPrice(selectedQuote),
        quote_id: selectedQuote.id,
        notes: formData.notes,
    };
    
    try {
        const result = await createBooking(bookingData);
        if (result.success && result.booking) {
            navigate(`/bookings/${result.booking.id}`);
        }
    } finally {
        setLoading(false);
    }
  };

  const calculateTotalPrice = (quote: QuoteData | null) => {
    if (!quote) return 0;
    const roomTotal = quote.room_arrangements?.reduce((sum, room) => sum + (room.total || 0), 0) || 0;
    const activitiesTotal = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;
    const transportTotal = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
    const transfersTotal = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
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
    return <BookingLoading />;
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
        <QuoteSummaryCard 
          quote={selectedQuote}
          totalPrice={calculateTotalPrice(selectedQuote)}
        />
        
        <BookingDetailsForm 
          formData={formData}
          onFormChange={setFormData}
          loading={loading}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/quotes')} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBooking;
