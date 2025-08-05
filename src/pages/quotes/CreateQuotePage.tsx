import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, FileText, Calculator, Hotel, Plane, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';

// Mock data for hotels
const mockHotels = [
  {
    id: '1',
    name: 'Zanzibar Beach Resort',
    category: '4-star',
    location: 'Stone Town',
    room_types: [
      { name: 'Standard Room', cost_per_night: 150 },
      { name: 'Ocean View Suite', cost_per_night: 200 },
      { name: 'Presidential Suite', cost_per_night: 350 }
    ]
  },
  {
    id: '2',
    name: 'Serengeti Safari Lodge',
    category: '5-star',
    location: 'Central Serengeti',
    room_types: [
      { name: 'Safari Tent', cost_per_night: 300 },
      { name: 'Safari Suite', cost_per_night: 450 }
    ]
  }
];

interface SleepingArrangement {
  id: string;
  room_number: number;
  adults: number;
  children_with_bed: number;
  children_no_bed: number;
  room_type: string;
  cost_per_night: number;
}

interface TransportOption {
  id: string;
  type: string;
  route: string;
  cost_per_person: number;
  total_passengers: number;
  total_cost: number;
}

interface TransferOption {
  id: string;
  type: string;
  route: string;
  cost_per_person: number;
  total_passengers: number;
  total_cost: number;
}

const CreateQuotePage = () => {
  const navigate = useNavigate();
  const { profile } = useSimpleAuth();
  const [searchParams] = useSearchParams();
  const inquiryId = searchParams.get('inquiry');
  
  const [loading, setLoading] = useState(false);
  const [inquiry, setInquiry] = useState<any>(null);
  const [loadingInquiry, setLoadingInquiry] = useState(true);

  const [formData, setFormData] = useState({
    selected_hotel_id: '',
    markup_percentage: 15,
    valid_until: '',
    notes: '',
    currency_code: 'USD'
  });

  const [orgSettings, setOrgSettings] = useState<any>(null);

  const [sleepingArrangements, setSleepingArrangements] = useState<SleepingArrangement[]>([]);
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [transferOptions, setTransferOptions] = useState<TransferOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch inquiry data and organization settings
  useEffect(() => {
    if (inquiryId && profile?.org_id) {
      fetchInquiry();
      fetchOrganizationSettings();
    }
  }, [inquiryId, profile?.org_id]);

  const fetchOrganizationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('org_id', profile?.org_id)
        .single();

      if (error) throw error;
      
      setOrgSettings(data);
      
      // Set default currency from organization settings
      if (data?.default_currency) {
        setFormData(prev => ({
          ...prev,
          currency_code: data.default_currency
        }));
      }
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      // Use USD as fallback
      setFormData(prev => ({ ...prev, currency_code: 'USD' }));
    }
  };

  // Set default valid until date
  useEffect(() => {
    const defaultValidUntil = new Date();
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      valid_until: defaultValidUntil.toISOString().split('T')[0]
    }));
  }, []);

  const fetchInquiry = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('id', inquiryId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast.error('Inquiry not found');
        navigate('/inquiries');
        return;
      }
      
      setInquiry(data);
      
      // Initialize sleeping arrangements based on number of rooms
      const arrangements: SleepingArrangement[] = [];
      for (let i = 1; i <= (data.num_rooms || 1); i++) {
        arrangements.push({
          id: `room_${i}`,
          room_number: i,
          adults: Math.floor(data.adults / (data.num_rooms || 1)),
          children_with_bed: Math.floor(data.children_with_bed / (data.num_rooms || 1)),
          children_no_bed: Math.floor(data.children_no_bed / (data.num_rooms || 1)),
          room_type: '',
          cost_per_night: 0
        });
      }
      setSleepingArrangements(arrangements);
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      toast.error('Failed to load inquiry data');
    } finally {
      setLoadingInquiry(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateSleepingArrangement = (id: string, field: string, value: any) => {
    setSleepingArrangements(prev => prev.map(arr => {
      if (arr.id === id) {
        const updated = { ...arr, [field]: value };
        
        // Update cost when room type changes
        if (field === 'room_type' && formData.selected_hotel_id) {
          const hotel = mockHotels.find(h => h.id === formData.selected_hotel_id);
          const roomType = hotel?.room_types.find(rt => rt.name === value);
          if (roomType) {
            updated.cost_per_night = roomType.cost_per_night;
          }
        }
        
        return updated;
      }
      return arr;
    }));
  };

  const addTransportOption = () => {
    const newTransport: TransportOption = {
      id: Date.now().toString(),
      type: '',
      route: '',
      cost_per_person: 0,
      total_passengers: inquiry?.adults + inquiry?.children || 1,
      total_cost: 0
    };
    setTransportOptions([...transportOptions, newTransport]);
  };

  const updateTransportOption = (id: string, field: string, value: any) => {
    setTransportOptions(prev => prev.map(transport => {
      if (transport.id === id) {
        const updated = { ...transport, [field]: value };
        if (field === 'cost_per_person') {
          updated.total_cost = value * updated.total_passengers;
        }
        return updated;
      }
      return transport;
    }));
  };

  const removeTransportOption = (id: string) => {
    setTransportOptions(prev => prev.filter(t => t.id !== id));
  };

  const addTransferOption = () => {
    const newTransfer: TransferOption = {
      id: Date.now().toString(),
      type: '',
      route: '',
      cost_per_person: 0,
      total_passengers: inquiry?.adults + inquiry?.children || 1,
      total_cost: 0
    };
    setTransferOptions([...transferOptions, newTransfer]);
  };

  const updateTransferOption = (id: string, field: string, value: any) => {
    setTransferOptions(prev => prev.map(transfer => {
      if (transfer.id === id) {
        const updated = { ...transfer, [field]: value };
        if (field === 'cost_per_person') {
          updated.total_cost = value * updated.total_passengers;
        }
        return updated;
      }
      return transfer;
    }));
  };

  const removeTransferOption = (id: string) => {
    setTransferOptions(prev => prev.filter(t => t.id !== id));
  };

  const calculateTotals = () => {
    const hotelTotal = sleepingArrangements.reduce((sum, arr) => 
      sum + (arr.cost_per_night * (inquiry?.nights_count || 1)), 0
    );
    
    const transportTotal = transportOptions.reduce((sum, t) => sum + t.total_cost, 0);
    const transferTotal = transferOptions.reduce((sum, t) => sum + t.total_cost, 0);
    
    const subtotal = hotelTotal + transportTotal + transferTotal;
    const markupAmount = (subtotal * formData.markup_percentage) / 100;
    const total = subtotal + markupAmount;
    
    return { hotelTotal, transportTotal, transferTotal, subtotal, markupAmount, total };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.selected_hotel_id) {
      newErrors.selected_hotel_id = 'Please select a hotel';
    }

    if (!formData.valid_until) {
      newErrors.valid_until = 'Valid until date is required';
    }

    if (sleepingArrangements.some(arr => !arr.room_type)) {
      newErrors.room_arrangements = 'Please select room type for all rooms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const totals = calculateTotals();
      
      // Calculate days and nights from dates
      const startDate = new Date(inquiry.check_in_date);
      const endDate = new Date(inquiry.check_out_date);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      const nights = days - 1;

      const quoteData = {
        inquiry_id: inquiryId,
        client: inquiry.client_name,
        client_email: inquiry.client_email,
        mobile: inquiry.client_mobile,
        destination: inquiry.destination,
        start_date: inquiry.check_in_date,
        end_date: inquiry.check_out_date,
        duration_days: days,
        duration_nights: nights,
        adults: inquiry.adults || inquiry.num_adults || 1,
        children_with_bed: inquiry.children_with_bed || 0,
        children_no_bed: inquiry.children_no_bed || 0,
        infants: inquiry.infants || 0,
        hotel_id: formData.selected_hotel_id,
        sleeping_arrangements: sleepingArrangements,
        transport_options: transportOptions,
        transfer_options: transferOptions,
        subtotal: totals.subtotal,
        markup_percentage: formData.markup_percentage,
        markup_amount: totals.markupAmount,
        total_amount: totals.total,
        currency_code: formData.currency_code,
        valid_until: formData.valid_until,
        notes: formData.notes,
        status: 'draft',
        created_by: profile?.id,
        org_id: profile?.org_id
      };

      const { data, error } = await supabase
        .from('quotes')
        .insert(quoteData as any)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Quote ${data.quote_number} created successfully!`);
      navigate('/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  const formatCurrency = (amount: number) => {
    const currency = formData.currency_code || 'USD';
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

  if (loadingInquiry) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Inquiry not found</p>
        <Button className="mt-4" asChild>
          <Link to="/inquiries">Back to Inquiries</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/quotes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Quote</h1>
          <p className="text-gray-600 mt-1">Generate a detailed quote for inquiry {inquiry.enquiry_number}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inquiry Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Inquiry Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Inquiry ID:</span>
                  <span className="ml-2 font-medium">{inquiry.enquiry_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Client:</span>
                  <span className="ml-2 font-medium">{inquiry.client_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Destination:</span>
                  <span className="ml-2 font-medium">{inquiry.destination}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-medium">{inquiry.days_count} days / {inquiry.nights_count} nights</span>
                </div>
                <div>
                  <span className="text-gray-600">Guests:</span>
                  <span className="ml-2 font-medium">{inquiry.adults} adults, {inquiry.children_with_bed + inquiry.children_no_bed} children</span>
                </div>
                <div>
                  <span className="text-gray-600">Rooms:</span>
                  <span className="ml-2 font-medium">{sleepingArrangements.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Hotel Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Hotel Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Hotel</Label>
                  <Select
                    value={formData.selected_hotel_id}
                    onValueChange={(value) => handleInputChange('selected_hotel_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockHotels.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                          {hotel.name} ({hotel.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.selected_hotel_id && (
                    <p className="text-sm text-red-600">{errors.selected_hotel_id}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sleeping Arrangements */}
            <Card>
              <CardHeader>
                <CardTitle>Sleeping Arrangements</CardTitle>
                <CardDescription>Configure room arrangements and occupancy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sleepingArrangements.map((arrangement) => (
                  <div key={arrangement.id} className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Room {arrangement.room_number}</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Adults</Label>
                        <Input
                          type="number"
                          min="0"
                          value={arrangement.adults}
                          onChange={(e) => updateSleepingArrangement(arrangement.id, 'adults', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Children with Bed</Label>
                        <Input
                          type="number"
                          min="0"
                          value={arrangement.children_with_bed}
                          onChange={(e) => updateSleepingArrangement(arrangement.id, 'children_with_bed', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Children no Bed</Label>
                        <Input
                          type="number"
                          min="0"
                          value={arrangement.children_no_bed}
                          onChange={(e) => updateSleepingArrangement(arrangement.id, 'children_no_bed', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Room Type</Label>
                        <Select
                          value={arrangement.room_type}
                          onValueChange={(value) => updateSleepingArrangement(arrangement.id, 'room_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.selected_hotel_id && mockHotels.find(h => h.id === formData.selected_hotel_id)?.room_types.map((roomType) => (
                              <SelectItem key={roomType.name} value={roomType.name}>
                                {roomType.name} - ${roomType.cost_per_night}/night
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                     {arrangement.room_type && (
                       <div className="text-sm text-gray-600">
                         Cost: {formatCurrency(arrangement.cost_per_night)}/night × {inquiry.nights_count} nights = {formatCurrency(arrangement.cost_per_night * inquiry.nights_count)}
                       </div>
                     )}
                  </div>
                ))}
                {errors.room_arrangements && (
                  <p className="text-sm text-red-600">{errors.room_arrangements}</p>
                )}
              </CardContent>
            </Card>

            {/* Transport Options */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Transport Options (Optional)
                    </CardTitle>
                  </div>
                  <Button type="button" onClick={addTransportOption} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transport
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {transportOptions.map((transport) => (
                  <div key={transport.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Transport Option</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTransportOption(transport.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Input
                          placeholder="Flight, Bus, etc."
                          value={transport.type}
                          onChange={(e) => updateTransportOption(transport.id, 'type', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Route</Label>
                        <Input
                          placeholder="From - To"
                          value={transport.route}
                          onChange={(e) => updateTransportOption(transport.id, 'route', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Cost per Person</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={transport.cost_per_person}
                          onChange={(e) => updateTransportOption(transport.id, 'cost_per_person', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                     <div className="text-sm text-gray-600">
                       Total: {formatCurrency(transport.cost_per_person)} × {transport.total_passengers} passengers = {formatCurrency(transport.total_cost)}
                     </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Transfer Options */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transfer Options (Optional)</CardTitle>
                  <Button type="button" onClick={addTransferOption} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transfer
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {transferOptions.map((transfer) => (
                  <div key={transfer.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Transfer Option</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTransferOption(transfer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Input
                          placeholder="Airport Transfer, etc."
                          value={transfer.type}
                          onChange={(e) => updateTransferOption(transfer.id, 'type', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Route</Label>
                        <Input
                          placeholder="Airport - Hotel"
                          value={transfer.route}
                          onChange={(e) => updateTransferOption(transfer.id, 'route', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Cost per Person</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={transfer.cost_per_person}
                          onChange={(e) => updateTransferOption(transfer.id, 'cost_per_person', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                     <div className="text-sm text-gray-600">
                       Total: {formatCurrency(transfer.cost_per_person)} × {transfer.total_passengers} passengers = {formatCurrency(transfer.total_cost)}
                     </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quote Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Markup Percentage (Hidden from client)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.markup_percentage}
                      onChange={(e) => handleInputChange('markup_percentage', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => handleInputChange('valid_until', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={formData.currency_code}
                      onValueChange={(value) => handleInputChange('currency_code', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                        <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                      </SelectContent>
                    </Select>
                    {orgSettings?.default_currency && (
                      <p className="text-xs text-gray-500 mt-1">
                        Organization default: {orgSettings.default_currency}
                      </p>
                    )}
                  </div>
                  <div></div>
                </div>

                <div>
                  <Label>Internal Notes</Label>
                  <textarea
                    placeholder="Internal notes for this quote..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Pricing Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
               <CardContent className="space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Hotel Total:</span>
                   <span className="font-medium">{formatCurrency(totals.hotelTotal)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Transport Total:</span>
                   <span className="font-medium">{formatCurrency(totals.transportTotal)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Transfer Total:</span>
                   <span className="font-medium">{formatCurrency(totals.transferTotal)}</span>
                 </div>
                 <div className="border-t pt-2">
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-600">Subtotal:</span>
                     <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-red-600">
                     <span>Markup ({formData.markup_percentage}%):</span>
                     <span>+{formatCurrency(totals.markupAmount)}</span>
                   </div>
                   <div className="flex justify-between text-lg font-bold border-t pt-2">
                     <span>Total Amount:</span>
                     <span className="text-teal-600">{formatCurrency(totals.total)}</span>
                   </div>
                 </div>
                <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                  💡 Markup is hidden from client preview
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
                      Creating Quote...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Quote
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/quotes')}
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

export default CreateQuotePage;