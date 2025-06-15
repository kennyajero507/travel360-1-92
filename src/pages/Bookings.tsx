import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { CalendarClock, CheckCircle, FileText, List, BarChart3, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Booking, BookingStatus } from "../types/booking.types";
import { BookingFilters as FilterType } from "../types/enhanced-booking.types";
import { getAllBookings } from "../services/bookingReadService";
import { updateBookingStatus } from "../services/bookingUpdateService";
import { enhancedBookingService } from "../services/enhancedBookingService";
import { convertToBooking } from "../utils/typeHelpers";
import BookingFilters from "../components/booking/BookingFilters";
import BulkBookingActions from "../components/booking/BulkBookingActions";
import BookingAnalyticsDashboard from "../components/booking/BookingAnalyticsDashboard";

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterType>({});
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  
  // Load bookings data
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getAllBookings();
      // Use convertToBooking to map each raw booking to Booking type
      const convertedBookings: Booking[] = data.map((raw: any) => {
        // Safely parse room_arrangement if it exists and is a string
        let roomArr: any[] = [];
        if (typeof raw.room_arrangement === "string") {
          try {
            roomArr = JSON.parse(raw.room_arrangement);
          } catch {
            roomArr = [];
          }
        } else if (Array.isArray(raw.room_arrangement)) {
          roomArr = raw.room_arrangement;
        }
        // Clone the booking and replace room_arrangement
        const bookingObj = { ...convertToBooking(raw), room_arrangement: roomArr };
        return bookingObj as Booking;
      });
      setBookings(convertedBookings);
      setFilteredBookings(convertedBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    if (Object.keys(filters).length === 0) {
      setFilteredBookings(bookings);
      return;
    }

    try {
      const filtered = await enhancedBookingService.getFilteredBookings(filters);
      setFilteredBookings(filtered);
    } catch (error) {
      console.error("Error applying filters:", error);
      toast.error("Failed to apply filters");
    }
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredBookings(bookings);
  };
  
  // Handle status update
  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus } 
          : booking
      );
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings.filter(booking => 
        filteredBookings.some(fb => fb.id === booking.id)
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

  // Handle individual booking selection
  const handleBookingSelect = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings(prev => [...prev, bookingId]);
    } else {
      setSelectedBookings(prev => prev.filter(id => id !== bookingId));
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tour Bookings</h1>
          <p className="text-gray-500">Manage your tour bookings and travel vouchers</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-blue-50 text-blue-700" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={() => navigate("/vouchers")}>
            <FileText className="h-4 w-4 mr-2" />
            Vouchers
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          {/* Advanced Filters */}
          {showFilters && (
            <BookingFilters
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={applyFilters}
              onClearFilters={clearFilters}
            />
          )}

          {/* Bulk Actions */}
          <BulkBookingActions
            bookings={filteredBookings}
            selectedBookings={selectedBookings}
            onSelectionChange={setSelectedBookings}
            onRefresh={loadBookings}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tour Bookings</span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  Showing {filteredBookings.length} of {bookings.length} bookings
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading bookings data...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {Object.keys(filters).length > 0 
                      ? "Try adjusting your filters or clear them to see all bookings"
                      : "Bookings will appear here when quotes are approved"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBookings(filteredBookings.map(b => b.id));
                            } else {
                              setSelectedBookings([]);
                            }
                          }}
                        />
                      </TableHead>
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
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedBookings.includes(booking.id)}
                            onCheckedChange={(checked) => handleBookingSelect(booking.id, !!checked)}
                          />
                        </TableCell>
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
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-green-300 hover:bg-green-50 text-green-700"
                                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                              </>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => viewVoucher(booking.id)}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Voucher
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-blue-300 hover:bg-blue-50 text-blue-700"
                                  onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                >
                                  <CalendarClock className="h-4 w-4 mr-1" />
                                  Complete
                                </Button>
                              </>
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
        </TabsContent>

        <TabsContent value="analytics">
          <BookingAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bookings;
