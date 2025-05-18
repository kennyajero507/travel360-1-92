
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { CalendarClock, CheckCircle, FileText, List, ShoppingCart, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Booking, BookingStatus } from "../types/booking.types";
import { getAllBookings, updateBookingStatus } from "../services/bookingService";

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Load bookings data
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await getAllBookings();
        setBookings(data as Booking[]);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings data");
      } finally {
        setLoading(false);
      }
    };
    
    loadBookings();
  }, []);
  
  // Handle status update
  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus } 
          : booking
      ));
      
      toast.success(`Booking status updated to ${newStatus}`);
      
      // If confirmed, show a message about voucher generation
      if (newStatus === 'confirmed') {
        toast.success("A travel voucher has been generated", {
          description: "The voucher can be viewed and sent to the client",
          action: {
            label: "View Vouchers",
            onClick: () => navigate("/vouchers")
          }
        });
      }
      
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };
  
  // View booking details
  const viewBookingDetails = (bookingId: string) => {
    navigate(`/bookings/${bookingId}`);
  };
  
  // View related voucher
  const viewVoucher = (bookingId: string) => {
    navigate(`/vouchers?bookingId=${bookingId}`);
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tour Bookings</h1>
          <p className="text-gray-500">Manage your tour bookings and travel vouchers</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/bookings")}>
            <List className="h-4 w-4 mr-2" />
            All Bookings
          </Button>
          <Button variant="outline" onClick={() => navigate("/vouchers")}>
            <FileText className="h-4 w-4 mr-2" />
            Vouchers
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tour Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading bookings data...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found</p>
              <p className="text-sm text-gray-400 mt-2">Bookings will appear here when quotes are approved</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Travel Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.booking_reference}
                    </TableCell>
                    <TableCell>{booking.client}</TableCell>
                    <TableCell>{booking.hotel_name}</TableCell>
                    <TableCell>
                      {new Date(booking.travel_start).toLocaleDateString()} - {new Date(booking.travel_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell>${booking.total_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewBookingDetails(booking.id)}
                        >
                          View
                        </Button>
                        
                        {booking.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-green-300 hover:bg-green-50 text-green-700"
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                        )}
                        
                        {booking.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-300 hover:bg-red-50 text-red-700"
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewVoucher(booking.id)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Voucher
                          </Button>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-blue-300 hover:bg-blue-50 text-blue-700"
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          >
                            <CalendarClock className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Bookings;
