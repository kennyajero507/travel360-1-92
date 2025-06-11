
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  FileText,
  CreditCard,
  Mail,
  Phone,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { getBookingById } from "../services/bookingService";
import { invoiceService } from "../services/invoiceService";
import PaymentTracker from "../components/booking/PaymentTracker";
import LoadingSpinner from "../components/common/LoadingSpinner";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const data = await getBookingById(bookingId!);
      setBooking(data);
    } catch (error) {
      console.error("Error loading booking details:", error);
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async () => {
    if (!booking) return;
    
    try {
      const invoice = await invoiceService.generateInvoiceFromBooking(booking.id);
      if (invoice) {
        toast.success("Invoice generated successfully");
        navigate(`/invoices/${invoice.id}`);
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-300",
      confirmed: "bg-green-50 text-green-700 border-green-300",
      completed: "bg-blue-50 text-blue-700 border-blue-300",
      cancelled: "bg-red-50 text-red-700 border-red-300"
    };

    return (
      <Badge variant="outline" className={statusConfig[status as keyof typeof statusConfig] || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading booking details..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-bold">Booking Not Found</h2>
        <p className="text-gray-600">The booking you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/bookings")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
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
            <h1 className="text-2xl font-bold">{booking.booking_reference}</h1>
            <p className="text-gray-600">Booking Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(booking.status)}
          <Button onClick={generateInvoice}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Trip Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Trip Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Travel Dates</Label>
                      <p className="text-lg">
                        {new Date(booking.travel_start).toLocaleDateString()} - 
                        {new Date(booking.travel_end).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Duration</Label>
                      <p className="text-lg">
                        {Math.ceil((new Date(booking.travel_end).getTime() - new Date(booking.travel_start).getTime()) / (1000 * 60 * 60 * 24))} nights
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Hotel</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-gray-500" />
                      <p className="text-lg">{booking.hotel_name}</p>
                    </div>
                  </div>

                  {booking.notes && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Notes</Label>
                        <p className="text-gray-800 mt-1">{booking.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Room Arrangements */}
              {booking.room_arrangement && booking.room_arrangement.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Room Arrangements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {booking.room_arrangement.map((room: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{room.type || `Room ${index + 1}`}</span>
                            <span className="text-gray-600">
                              {room.adults || 0} Adults, {room.children || 0} Children
                            </span>
                          </div>
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
                    <CardTitle>Activities & Excursions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {booking.activities.map((activity: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <h4 className="font-medium">{activity.name || activity.title}</h4>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="payments">
              <PaymentTracker 
                bookingId={booking.id} 
                bookingAmount={booking.total_price} 
              />
            </TabsContent>

            <TabsContent value="communications">
              <Card>
                <CardHeader>
                  <CardTitle>Communication History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Communication tracking feature coming soon</p>
                    <p className="text-sm">Email logs and client communications will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <p className="text-lg">{booking.client}</p>
              </div>
              
              {/* Add contact information when available */}
              <div className="pt-3 border-t">
                <Button variant="outline" className="w-full mb-2">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Client
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">${booking.total_price.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={generateInvoice}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Invoice
                </Button>
                <Button variant="outline" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Voucher
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Confirmation
              </Button>
              <Button variant="outline" className="w-full">
                Modify Booking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function Label({ className, children, ...props }: any) {
  return (
    <label className={`block text-sm font-medium ${className || ''}`} {...props}>
      {children}
    </label>
  );
}

export default BookingDetails;
