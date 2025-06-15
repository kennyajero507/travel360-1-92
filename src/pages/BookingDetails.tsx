
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingDetails } from '../hooks/useBookingDetails';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { BookingStatusBadge } from '../components/booking/BookingStatusBadge';
import PaymentTracker from '../components/booking/PaymentTracker';
import RecordPaymentDialog from '../components/booking/RecordPaymentDialog';
import { ArrowLeft, Download, Send, CreditCard, FileText } from 'lucide-react';
import { BookingStatus } from '../types/booking.types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from 'date-fns';
import { toast } from 'sonner';

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    booking,
    isLoading,
    isError,
    updateStatus,
    isUpdatingStatus,
    invoice,
    isLoadingInvoice,
    createInvoice,
    isCreatingInvoice,
  } = useBookingDetails(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Booking Not Found</h2>
        <p className="text-gray-600">The booking you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/bookings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
      </div>
    );
  }

  const handleStatusUpdate = (status: BookingStatus) => {
    updateStatus(status);
  };

  const handleCreateInvoice = () => {
    createInvoice();
  };

  const handleDownloadVoucher = () => {
    toast.info('Voucher download feature coming soon');
  };

  const totalTravelers = (booking.room_arrangement || []).reduce((total, room) => {
    return total + room.adults + room.children_with_bed + room.children_no_bed + room.infants;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{booking.booking_reference}</h1>
            <p className="text-gray-600">Booking for {booking.client}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          <Button variant="outline" onClick={handleDownloadVoucher}>
            <Download className="h-4 w-4 mr-2" />
            Voucher
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Client</p>
                <p className="font-medium">{booking.client}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Hotel</p>
                <p className="font-medium">{booking.hotel_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Check-in</p>
                <p className="font-medium">{formatDate(new Date(booking.travel_start), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Check-out</p>
                <p className="font-medium">{formatDate(new Date(booking.travel_end), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Travelers</p>
                <p className="font-medium">{totalTravelers}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Price</p>
                <p className="font-medium text-lg text-green-600">
                  ${booking.total_price?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {booking.notes && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm bg-gray-50 p-2 rounded">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Management */}
        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
            <CardDescription>Update booking status and manage workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'] as BookingStatus[]).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={booking.status === status ? 'default' : 'outline'}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdatingStatus}
                  className="capitalize"
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Invoice Management</h4>
              {isLoadingInvoice ? (
                <Skeleton className="h-10 w-full" />
              ) : invoice ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">Invoice {invoice.invoice_number}</p>
                    <p className="text-sm text-green-600">Status: {invoice.status}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleCreateInvoice} 
                  disabled={isCreatingInvoice}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isCreatingInvoice ? 'Creating...' : 'Create Invoice'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Room Arrangements */}
        {booking.room_arrangement && booking.room_arrangement.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Room Arrangements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {booking.room_arrangement.map((room, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{room.room_type}</h4>
                    <div className="space-y-1 text-sm">
                      <p>Rooms: {room.num_rooms}</p>
                      <p>Adults: {room.adults}</p>
                      {room.children_with_bed > 0 && <p>Children (with bed): {room.children_with_bed}</p>}
                      {room.children_no_bed > 0 && <p>Children (no bed): {room.children_no_bed}</p>}
                      {room.infants > 0 && <p>Infants: {room.infants}</p>}
                      <p className="font-medium text-green-600">Total: ${room.total?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Tracking */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentTracker bookingId={booking.id} totalAmount={booking.total_price || 0} />
            <div className="mt-4">
              <RecordPaymentDialog bookingId={booking.id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingDetails;
