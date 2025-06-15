
import React, { useState } from "react";
import { useBookingData } from "../hooks/useBookingData";
import { BookingTable } from "../components/booking/BookingTable";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import BulkBookingActions from "../components/booking/BulkBookingActions";
import { BookingStatus } from "../types/booking.types";
import { Skeleton } from "@/components/ui/skeleton";
import BookingAnalyticsDashboard from "../components/booking/BookingAnalyticsDashboard";
import BookingFilters from "../components/booking/BookingFilters";
import { BookingFilters as FilterType } from "../types/enhanced-booking.types";
import { toast } from "sonner";

const Bookings = () => {
  const {
    bookings,
    isLoading,
    error,
    selectedBookings,
    setSelectedBookings,
    updateBookingStatus,
    bulkUpdateStatus,
    bulkDelete
  } = useBookingData();
  
  const [filters, setFilters] = useState<FilterType>({});

  const handleSelectBooking = (id: string, checked: boolean) => {
    setSelectedBookings((prev) =>
      checked ? [...prev, id] : prev.filter((bId) => bId !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && bookings) {
      setSelectedBookings(bookings.map((b) => b.id));
    } else {
      setSelectedBookings([]);
    }
  };
  
  const handleStatusUpdate = (id: string, status: BookingStatus) => {
    updateBookingStatus({ id, status });
  };
  
  const handleView = (id: string) => {
    toast.info(`Navigating to view booking: ${id.substring(0,8)}...`);
    // In a real app, you would use react-router-dom's navigate function here
    // e.g., navigate(`/bookings/${id}`);
  };
  
  const handleVoucher = (id: string) => {
    toast.info(`Generating voucher for booking: ${id.substring(0,8)}...`);
    // Logic to open voucher generation modal or navigate to a voucher page
  };
  
  const handleBulkUpdate = (status: BookingStatus) => {
    if (selectedBookings.length === 0) {
      toast.warning("No bookings selected.");
      return;
    }
    bulkUpdateStatus({ ids: selectedBookings, status })
      .then(() => setSelectedBookings([]));
  };
  
  const handleBulkDelete = () => {
    if (selectedBookings.length === 0) {
      toast.warning("No bookings selected.");
      return;
    }
    bulkDelete(selectedBookings)
      .then(() => setSelectedBookings([]));
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <Skeleton className="h-4 w-[10%]" />
              <Skeleton className="h-4 w-[15%]" />
              <Skeleton className="h-4 w-[15%]" />
              <Skeleton className="h-4 w-[20%]" />
              <Skeleton className="h-4 w-[10%]" />
              <Skeleton className="h-4 w-[10%]" />
              <Skeleton className="h-8 w-[15%]" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 text-red-500">
          <p>Failed to load bookings. Please try again later.</p>
        </div>
      );
    }
    
    return (
      <div className="border rounded-md">
        <BookingTable
          bookings={bookings || []}
          selectedBookings={selectedBookings}
          onSelectBooking={handleSelectBooking}
          onSelectAll={handleSelectAll}
          onView={handleView}
          onStatusUpdate={handleStatusUpdate}
          onVoucher={handleVoucher}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-gray-500 mt-2">View and manage all your travel bookings.</p>
        </div>
        <Button onClick={() => toast.info("Create new booking form not implemented yet.")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Booking
        </Button>
      </div>

      <BookingAnalyticsDashboard />
      
      <BookingFilters 
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={() => toast.info(`Filtering not implemented yet. Filters: ${JSON.stringify(filters)}`)}
        onClearFilters={() => setFilters({})}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Bookings</CardTitle>
            {bookings && bookings.length > 0 && (
              <BulkBookingActions
                  bookings={bookings}
                  selectedBookings={selectedBookings}
                  onSelectionChange={setSelectedBookings}
                  onBulkStatusUpdate={handleBulkUpdate}
                  onBulkDelete={handleBulkDelete}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Bookings;
