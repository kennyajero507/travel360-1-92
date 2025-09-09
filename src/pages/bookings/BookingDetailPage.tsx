import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Calendar, 
  MapPin, 
  Mail, 
  Clock,
  FileText,
  Send,
  Download,
  DollarSign,
  CheckCircle,
  XCircle,
  Hotel,
  Plane,
  Car,
  CreditCard
} from 'lucide-react';
import type { DatabaseBooking } from '../../types/database';

const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useSimpleAuth();
  const [booking, setBooking] = useState<DatabaseBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    if (!id || !profile?.org_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .eq('org_id', profile.org_id)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', booking.id);

      if (error) throw error;

      setBooking(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Booking not found</h3>
        <p className="mt-1 text-sm text-gray-500">The booking you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/bookings">Back to Bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canManageBooking = profile?.role === 'org_owner' || profile?.role === 'tour_operator' || booking.agent_id === profile?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/bookings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {booking.booking_reference || `BK-${booking.id.slice(0, 8)}`}
            </h1>
            <p className="text-gray-600 mt-1">Booking details and management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
          {canManageBooking && (
            <Button asChild variant="outline">
              <Link to={`/bookings/${booking.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Booking
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Client & Travel Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Booking Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Client Name</p>
                      <p className="text-lg font-semibold">{booking.client}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(Number(booking.total_price))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Hotel</p>
                        <p className="text-sm">{booking.hotel_name}</p>
                      </div>
                    </div>
                    {booking.client_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email</p>
                          <p className="text-sm">{booking.client_email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Check-in</p>
                        <p className="text-sm">{new Date(booking.travel_start).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Check-out</p>
                        <p className="text-sm">{new Date(booking.travel_end).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">Notes</p>
                      <p className="text-sm text-blue-800">{booking.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Accommodation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Hotel className="h-5 w-5" />
                      Accommodation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{booking.hotel_name}</p>
                      {booking.room_arrangement && (
                        <div className="text-sm text-gray-600">
                          <p>Room arrangement details</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Transport */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Car className="h-5 w-5" />
                      Transport
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {booking.transport ? (
                      <div className="text-sm">
                        <p>Transport services included</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No transport services</p>
                    )}
                  </CardContent>
                </Card>

                {/* Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Plane className="h-5 w-5" />
                      Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {booking.activities ? (
                      <div className="text-sm">
                        <p>Activities and excursions included</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No activities scheduled</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg">
                      <span className="text-lg font-bold">Total Amount</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(Number(booking.total_price))}
                      </span>
                    </div>

                    <div className="text-center py-8">
                      <CreditCard className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Payment tracking coming soon</p>
                      <p className="text-xs text-gray-500">Payment details and history will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents & Vouchers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">No documents available</p>
                    <p className="text-xs text-gray-500">Vouchers and documents will appear here</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Voucher
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Current Status</p>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              
              {canManageBooking && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Quick Actions</p>
                  {booking.status === 'pending' && (
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </Button>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Completed
                    </Button>
                  )}
                  
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Voucher
              </Button>
              
              <Button variant="outline" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Confirmation
              </Button>
              
              {booking.client_email && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`mailto:${booking.client_email}?subject=Booking ${booking.booking_reference}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-gray-600">{new Date(booking.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-gray-600">{new Date(booking.updated_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Booking ID</p>
                  <p className="text-gray-600 font-mono">{booking.id.slice(0, 8)}...</p>
                </div>
              </div>

              {booking.quote_id && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Source Quote</p>
                    <Button variant="link" className="p-0 h-auto text-blue-600" asChild>
                      <Link to={`/quotes/${booking.quote_id}`}>
                        View Quote
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;