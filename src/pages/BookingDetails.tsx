import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Calendar, MapPin, Users, Hotel, Phone, Mail, FileText, Download, Plane, Car } from "lucide-react";
import { useBookingData } from "../hooks/useBookingData";
import { toast } from "sonner";

const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { bookings } = useBookingData();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId && bookings.length > 0) {
      const foundBooking = bookings.find(b => b.id === bookingId);
      setBooking(foundBooking);
      setLoading(false);
    }
  }, [bookingId, bookings]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderActivities = () => {
    if (!Array.isArray(booking.activities) || booking.activities.length === 0) {
      return <p className="text-gray-500">No activities booked for this trip.</p>;
    }

    return booking.activities.map((activity: any, index: number) => (
      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
        <div>
          <h4 className="font-medium">{activity.name}</h4>
          <p className="text-sm text-gray-600">{activity.description}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">${activity.cost?.toFixed(2)}</p>
          <p className="text-sm text-gray-600">{activity.num_people} people</p>
        </div>
      </div>
    ));
  };

  const renderTransportsAndTransfers = () => {
    const hasTransport = Array.isArray(booking.transport) && booking.transport.length > 0;
    const hasTransfers = Array.isArray(booking.transfers) && booking.transfers.length > 0;

    if (!hasTransport && !hasTransfers) {
      return <p className="text-gray-500">No transport or transfers booked for this trip.</p>;
    }

    return (
      <>
        {hasTransport && (
          <div>
            <h4 className="font-medium mb-2">Transportation</h4>
            <div className="space-y-2">
              {booking.transport.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span>{item.type}: {item.from} → {item.to}</span>
                  <span className="font-medium">${item.cost?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasTransfers && (
          <div>
            <h4 className="font-medium mb-2">Transfers</h4>
            <div className="space-y-2">
              {booking.transfers.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span>{item.type}: {item.from} → {item.to}</span>
                  <span className="font-medium">${item.cost?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
        <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/bookings")}>
          Back to Bookings
        </Button>
      </div>
    );
  }

  const quote = booking.quote;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600">Reference: {booking.booking_reference}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Voucher
          </Button>
          <Button onClick={() => navigate("/bookings")}>
            Back to Bookings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <p className="text-gray-900">{booking.client}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {quote?.mobile || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Travel Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {quote?.destination}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                  <p className="text-gray-900">{new Date(booking.travel_start).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                  <p className="text-gray-900">{new Date(booking.travel_end).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p className="text-gray-900">{quote?.duration_nights} nights, {quote?.duration_days} days</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Type</label>
                  <p className="text-gray-900 capitalize">{quote?.tour_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Arrangements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Room Arrangements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(booking.room_arrangement) ? booking.room_arrangement.map((arrangement: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{arrangement.room_type}</h4>
                      <Badge variant="secondary">{arrangement.num_rooms} room(s)</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <span>{arrangement.adults} Adults</span>
                      {arrangement.children_with_bed > 0 && <span>{arrangement.children_with_bed} CWB</span>}
                      {arrangement.children_no_bed > 0 && <span>{arrangement.children_no_bed} CNB</span>}
                      {arrangement.infants > 0 && <span>{arrangement.infants} Infants</span>}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500">No room arrangements available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activities */}
          {Array.isArray(booking.activities) && booking.activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.activities.map((activity: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{activity.name}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${activity.cost?.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{activity.num_people} people</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transport & Transfers */}
          {(Array.isArray(booking.transport) && booking.transport.length > 0) ||
           (Array.isArray(booking.transfers) && booking.transfers.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Transport & Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(booking.transport) && booking.transport.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Transportation</h4>
                    <div className="space-y-2">
                      {booking.transport.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span>{item.type}: {item.from} → {item.to}</span>
                          <span className="font-medium">${item.cost?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {Array.isArray(booking.transfers) && booking.transfers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Transfers</h4>
                    <div className="space-y-2">
                      {booking.transfers.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <span>{item.type}: {item.from} → {item.to}</span>
                          <span className="font-medium">${item.cost?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Total */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                <Badge 
                  variant={booking.status === 'confirmed' ? 'default' : 
                          booking.status === 'cancelled' ? 'destructive' : 'secondary'}
                >
                  {booking.status}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-lg font-bold text-teal-600">
                  ${booking.total_price?.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Currency</span>
                <span>{quote?.currency_code || 'USD'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Hotel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Hotel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium text-lg">{booking.hotel_name}</h3>
              <p className="text-sm text-gray-600 mt-1">{quote?.destination}</p>
            </CardContent>
          </Card>

          {/* Notes */}
          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
