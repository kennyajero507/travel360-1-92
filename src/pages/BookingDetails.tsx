
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { 
  CalendarDays, 
  CheckCircle, 
  Download, 
  FileText, 
  Hotel, 
  Mail, 
  MapPin, 
  Phone, 
  UserRound, 
  XCircle,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { Booking, BookingStatus } from "../types/booking.types";
import { getBookingById, updateBookingStatus, createVoucherForBooking, getVoucherByBookingId } from "../services/bookingService";
import { getQuoteById } from "../services/quoteService";
import { QuoteData } from "../types/quote.types";

const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [hasVoucher, setHasVoucher] = useState(false);
  
  // Load booking data
  useEffect(() => {
    const loadBookingData = async () => {
      if (!bookingId) return;
      
      try {
        // Get booking details
        const bookingData = await getBookingById(bookingId);
        setBooking(bookingData);
        
        if (bookingData) {
          // Get original quote
          const quoteData = await getQuoteById(bookingData.quote_id);
          setQuote(quoteData);
          
          // Check if voucher exists
          const voucher = await getVoucherByBookingId(bookingId);
          setHasVoucher(voucher !== null);
        }
      } catch (error) {
        console.error("Error loading booking data:", error);
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    
    loadBookingData();
  }, [bookingId]);
  
  // Handle status update
  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    if (!booking) return;
    
    try {
      await updateBookingStatus(booking.id, newStatus);
      
      // Update local state
      setBooking(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast.success(`Booking status updated to ${newStatus}`);
      
      // If confirmed, check if voucher needs to be created
      if (newStatus === 'confirmed' && !hasVoucher) {
        const voucher = await createVoucherForBooking(booking.id);
        if (voucher) {
          setHasVoucher(true);
          toast.success("Travel voucher has been generated", {
            action: {
              label: "View",
              onClick: () => navigate(`/vouchers/${voucher.id}`)
            }
          });
        }
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };
  
  // View voucher
  const viewVoucher = () => {
    if (booking) {
      navigate(`/vouchers?bookingId=${booking.id}`);
    }
  };
  
  // Generate voucher
  const generateVoucher = async () => {
    if (!booking) return;
    
    try {
      const voucher = await createVoucherForBooking(booking.id);
      if (voucher) {
        setHasVoucher(true);
        toast.success("Travel voucher has been generated");
      }
    } catch (error) {
      console.error("Error generating voucher:", error);
      toast.error("Failed to generate travel voucher");
    }
  };
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status: BookingStatus) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading booking details...</div>;
  }
  
  if (!booking) {
    return (
      <div className="text-center py-8">
        <p>Booking not found or unable to load booking data.</p>
        <Button className="mt-4" onClick={() => navigate("/bookings")}>
          Return to Bookings
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            className="pl-0 mb-2" 
            onClick={() => navigate("/bookings")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Booking #{booking.booking_reference}</h1>
          <p className="text-gray-500">Created on {new Date(booking.created_at || '').toLocaleString()}</p>
        </div>
        
        <div className="flex gap-2">
          {booking.status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                className="border-red-300 hover:bg-red-50 hover:text-red-700" 
                onClick={() => handleStatusUpdate('cancelled')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusUpdate('confirmed')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Booking
              </Button>
            </>
          )}
          
          {booking.status === 'confirmed' && !hasVoucher && (
            <Button onClick={generateVoucher}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Voucher
            </Button>
          )}
          
          {booking.status === 'confirmed' && hasVoucher && (
            <>
              <Button variant="outline" onClick={viewVoucher}>
                <FileText className="h-4 w-4 mr-2" />
                View Voucher
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={() => handleStatusUpdate('completed')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Booking Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Booking Status</CardTitle>
            {renderStatusBadge(booking.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p>{new Date(booking.created_at || '').toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p>{new Date(booking.updated_at || '').toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Original Quote</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => navigate(`/quotes/${booking.quote_id}`)}
                >
                  View Quote
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Price</p>
                <p className="text-xl font-bold text-green-600">${booking.total_price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Client Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-blue-600" />
            <CardTitle>Client Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Client Name</p>
              <p>{booking.client}</p>
            </div>
            {quote?.mobile && (
              <div>
                <p className="text-sm font-medium text-gray-500">Mobile</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p>{quote.mobile}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Hotel Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Hotel className="h-5 w-5 text-blue-600" />
            <CardTitle>Hotel Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Hotel Name</p>
              <p className="text-lg font-medium">{booking.hotel_name}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Destination</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p>{quote?.destination || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Travel Period</p>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <p>
                  {new Date(booking.travel_start).toLocaleDateString()} - {new Date(booking.travel_end).toLocaleDateString()}
                  {quote && ` (${quote.duration.nights} nights)`}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-3">Room Arrangements</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Type</TableHead>
                    <TableHead className="text-right">Rooms</TableHead>
                    <TableHead className="text-right">Guests</TableHead>
                    <TableHead className="text-right">Nights</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(booking.room_arrangement) && booking.room_arrangement.map((room, index) => (
                    <TableRow key={index}>
                      <TableCell>{room.roomType || "Standard Room"}</TableCell>
                      <TableCell className="text-right">{room.numRooms}</TableCell>
                      <TableCell className="text-right">
                        {room.adults + room.childrenWithBed + room.childrenNoBed}
                        {room.infants > 0 && ` +${room.infants} infant(s)`}
                      </TableCell>
                      <TableCell className="text-right">{room.nights}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/bookings")}
        >
          Back to Bookings
        </Button>
        
        {booking.status === 'confirmed' && hasVoucher && (
          <Button onClick={viewVoucher}>
            <FileText className="h-4 w-4 mr-2" />
            View Voucher
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
