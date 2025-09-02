import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Calendar, Users, FileText, Hotel } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

const BookingCreatePage = () => {
  const navigate = useNavigate();
  const { profile } = useSimpleAuth();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quote');
  
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  const [formData, setFormData] = useState({
    client: '',
    client_email: '',
    client_mobile: '',
    destination: '',
    hotel_name: '',
    travel_start: '',
    travel_end: '',
    total_price: 0,
    status: 'pending',
    notes: '',
    room_arrangement: {},
    transport: {},
    transfers: {},
    activities: {}
  });

  // Fetch quote data
  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    } else {
      setLoadingQuote(false);
    }
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .maybeSingle();

      if (error) throw error;
      
      setQuote(data);
      
      // Pre-fill form with quote data
      if (data) {
        setFormData({
          client: data.client || '',
          client_email: data.client_email || '',
          client_mobile: data.mobile || '',
          destination: data.destination || '',
          hotel_name: 'Selected from Quote',
          travel_start: data.start_date || '',
          travel_end: data.end_date || '',
          total_price: data.total_amount || 0,
          status: 'pending',
          notes: data.notes || '',
          room_arrangement: data.sleeping_arrangements || {},
          transport: data.transport_options || {},
          transfers: data.transfer_options || {},
          activities: data.activities || {}
        });
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Failed to load quote data');
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['client', 'client_email', 'destination', 'travel_start', 'travel_end'];
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`${field.replace('_', ' ')} is required`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        booking_reference: `BK-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Date.now().toString().slice(-3)}`,
        client: formData.client,
        client_email: formData.client_email,
        client_mobile: formData.client_mobile,
        destination: formData.destination,
        hotel_name: formData.hotel_name,
        travel_start: formData.travel_start,
        travel_end: formData.travel_end,
        total_price: formData.total_price,
        status: formData.status,
        notes: formData.notes,
        room_arrangement: formData.room_arrangement,
        transport: formData.transport,
        transfers: formData.transfers,
        activities: formData.activities,
        quote_id: quoteId,
        agent_id: profile?.id,
        org_id: profile?.org_id
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Booking ${data.booking_reference} created successfully!`);
      navigate('/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = quote?.currency_code || 'USD';
    const symbol = {
      'USD': '$',
      'KES': 'KSh',
      'EUR': '€',
      'GBP': '£',
      'TZS': 'TSh',
      'UGX': 'USh'
    }[currency] || '$';
    
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loadingQuote) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Quote not found</p>
        <Button className="mt-4" asChild>
          <Link to="/quotes">Back to Quotes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Booking</h1>
          <p className="text-gray-600 mt-1">Convert quote {quote.quote_number} to confirmed booking</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quote Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Quote Number:</span>
                  <span className="ml-2 font-medium">{quote.quote_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-medium text-green-600">{formatCurrency(quote.total_amount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="ml-2 font-medium">{new Date(quote.valid_until).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Currency:</span>
                  <span className="ml-2 font-medium">{quote.currency_code}</span>
                </div>
              </CardContent>
            </Card>

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
                    <Label>Client Name *</Label>
                    <Input
                      value={formData.client}
                      onChange={(e) => handleInputChange('client', e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => handleInputChange('client_email', e.target.value)}
                      placeholder="client@email.com"
                    />
                  </div>
                </div>
                <div>
                  <Label>Mobile Phone</Label>
                  <Input
                    value={formData.client_mobile}
                    onChange={(e) => handleInputChange('client_mobile', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Travel Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Travel Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Destination *</Label>
                    <Input
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      placeholder="Travel destination"
                    />
                  </div>
                  <div>
                    <Label>Hotel</Label>
                    <Input
                      value={formData.hotel_name}
                      onChange={(e) => handleInputChange('hotel_name', e.target.value)}
                      placeholder="Hotel name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Travel Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.travel_start}
                      onChange={(e) => handleInputChange('travel_start', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Travel End Date *</Label>
                    <Input
                      type="date"
                      value={formData.travel_end}
                      onChange={(e) => handleInputChange('travel_end', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Total Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.total_price}
                      onChange={(e) => handleInputChange('total_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Booking Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Label>Special Instructions</Label>
                <textarea
                  placeholder="Any special requirements or notes for this booking..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mt-2"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{formData.client || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">{formData.destination || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {formData.travel_start && formData.travel_end 
                      ? `${Math.ceil((new Date(formData.travel_end).getTime() - new Date(formData.travel_start).getTime()) / (1000 * 60 * 60 * 24))} days`
                      : 'Not specified'
                    }
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-teal-600">{formatCurrency(formData.total_price)}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  💡 This will create a confirmed booking from the approved quote
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Booking
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/bookings')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingCreatePage;