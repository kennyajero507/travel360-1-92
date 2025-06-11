
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ArrowLeft, User, MapPin, Calendar, DollarSign, FileText, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { getBookingById } from "../services/bookingService";
import { Booking } from "../types/booking.types";
import { convertToBooking } from "../utils/typeHelpers";
import VoucherManager from "../components/voucher/VoucherManager";
import PaymentTracker from "../components/booking/PaymentTracker";

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBookingDetails(id);
    }
  }, [id]);

  const loadBookingDetails = async (bookingId: string) => {
    try {
      const data = await getBookingById(bookingId);
      if (data) {
        setBooking(convertToBooking(data));
      } else {
        toast.error("Booking not found");
        navigate("/bookings");
      }
    } catch (error) {
      console.error("Error loading booking details:", error);
      toast.error("Failed to load booking details");
      navigate("/bookings");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-300",
      confirmed: "bg-green-50 text-green-700 border-green-300",
      cancelled: "bg-red-50 text-red-700 border-red-300",
      completed: "bg-blue-50 text-blue-700 border-blue-300"
    };

    return (
      <Badge variant="outline" className={statusColors[status as keyof typeof statusColors] || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/bookings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
        <div className="text-center py-8">Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/bookings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
        <div className="text-center py-8">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/bookings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Booking {booking.booking_reference}
            </h1>
            <p className="text-gray-500">
              {booking.client} • {booking.hotel_name}
            </p>
          </div>
        </div>
        {renderStatusBadge(booking.status)}
      </div>

      {/* Booking Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{booking.client}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Hotel</p>
                <p className="font-medium">{booking.hotel_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Travel Period</p>
                <p className="font-medium">
                  {new Date(booking.travel_start).toLocaleDateString()} - {new Date(booking.travel_end).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-medium">${booking.total_price.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {booking.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Notes:</strong> {booking.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="vouchers">
            <FileText className="h-4 w-4 mr-2" />
            Vouchers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6">
            {/* Room Arrangements */}
            {booking.room_arrangement && booking.room_arrangement.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Room Arrangements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.room_arrangement.map((room, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{room.room_type}</p>
                        <p className="text-sm text-gray-600">
                          {room.adults} Adults, {room.children} Children
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transport */}
            {booking.transport && booking.transport.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transport</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.transport.map((transport, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{transport.mode}</p>
                        <p className="text-sm text-gray-600">{transport.details}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activities */}
            {booking.activities && booking.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.activities.map((activity, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <PaymentTracker 
            bookingId={booking.id} 
            bookingAmount={booking.total_price} 
          />
        </TabsContent>

        <TabsContent value="vouchers">
          <VoucherManager bookingId={booking.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingDetails;
