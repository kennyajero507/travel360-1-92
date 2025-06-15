
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, RefreshCw, FileText, Upload } from 'lucide-react';
import { BookingTable } from '../components/booking/BookingTable';
import { useBookingData } from '../hooks/useBookingData';
import { toast } from 'sonner';

const Bookings = () => {
  const { bookings, isLoading, error, refetch, updateBookingStatus, createVoucher, selectedBookings, setSelectedBookings } = useBookingData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    const matchesDate = dateFilter === 'all' || (() => {
      const bookingDate = new Date(booking.travel_start);
      const now = new Date();
      
      switch (dateFilter) {
        case 'upcoming':
          return bookingDate >= now;
        case 'current':
          const today = new Date();
          const startDate = new Date(booking.travel_start);
          const endDate = new Date(booking.travel_end);
          return startDate <= today && endDate >= today;
        case 'past':
          return new Date(booking.travel_end) < now;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleSelectBooking = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings(prev => [...prev, id]);
    } else {
      setSelectedBookings(prev => prev.filter(bookingId => bookingId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(filteredBookings.map(booking => booking.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleView = (id: string) => {
    window.location.href = `/bookings/${id}`;
  };

  const handleVoucher = async (id: string) => {
    try {
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        await createVoucher(booking);
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Bookings</CardTitle>
            <CardDescription className="text-red-600">
              There was an error loading your bookings. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
          <p className="text-gray-600">Manage and track all your bookings</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/bookings/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Dates</option>
          <option value="upcoming">Upcoming</option>
          <option value="current">Current</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* Bookings Table */}
      <BookingTable 
        bookings={filteredBookings}
        selectedBookings={selectedBookings}
        onSelectBooking={handleSelectBooking}
        onSelectAll={handleSelectAll}
        onView={handleView}
        onStatusUpdate={updateBookingStatus}
        onVoucher={handleVoucher}
      />
    </div>
  );
};

export default Bookings;
