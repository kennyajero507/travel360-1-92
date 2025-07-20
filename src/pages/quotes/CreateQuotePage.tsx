import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, FileText, Calculator, Hotel, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for hotels and transport
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
    ],
    meal_plans: [
      { type: 'Room Only', additional_cost: 0 },
      { type: 'Breakfast', additional_cost: 25 },
      { type: 'Half Board', additional_cost: 50 },
      { type: 'Full Board', additional_cost: 80 }
    ]
  },
  {
    id: '2',
    name: 'Serengeti Safari Lodge',
    category: '5-star',
    location: 'Central Serengeti',
    room_types: [
      { name: 'Safari Tent', cost_per_night: 300 },
      { name: 'Safari Suite', cost_per_night: 450 },
      { name: 'Presidential Safari Suite', cost_per_night: 650 }
    ],
    meal_plans: [
      { type: 'Full Board', additional_cost: 0 },
      { type: 'All Inclusive', additional_cost: 100 }
    ]
  }
];

const mockTransport = [
  { id: '1', type: 'Airport Transfer', route: 'Airport - Hotel', cost_per_person: 25 },
  { id: '2', type: 'Flight', route: 'Nairobi - Zanzibar', cost_per_person: 150 },
  { id: '3', type: 'Safari Vehicle', route: 'Game Drive', cost_per_person: 80 }
];

// Mock inquiry data
const mockInquiry = {
  id: '1',
  inquiry_id: 'ENQ-2501-001',
  client_name: 'Sarah Johnson',
  client_email: 'sarah@email.com',
  destination: 'Zanzibar, Tanzania',
  travel_start: '2025-03-15',
  travel_end: '2025-03-22',
  number_of_guests: 2
};

interface QuoteHotel {
  id: string;
  hotel_id: string;
  hotel_name: string;
  hotel_category: string;
  location: string;
  check_in: string;
  check_out: string;
  nights: number;
  room_type: string;
  meal_plan: string;
  cost_per_night: number;
  total_cost: number;
  is_primary: boolean;
}

interface QuoteTransport {
  id: string;
  transport_type: string;
  vendor_name: string;
  route: string;
  cost_per_person: number;
  total_cost: number;
}

interface RoomArrangement {
  id: string;
  room_type: string;
  occupancy: number;
  number_of_rooms: number;
  cost_per_room: number;
  total_cost: number;
}

const CreateQuotePage = () => {
  const navigate = useNavigate();
  const { profile } = useSimpleAuth();
  const [searchParams] = useSearchParams();
  const inquiryId = searchParams.get('inquiry');
  
  const [loading, setLoading] = useState(false);
  const [inquiry] = useState(mockInquiry); // In real app, fetch based on inquiryId

  const [formData, setFormData] = useState({
    inquiry_id: inquiryId || '',
    valid_until: '',
    markup_percentage: 15,
    notes: ''
  });

  const [hotels, setHotels] = useState<QuoteHotel[]>([]);
  const [transport, setTransport] = useState<QuoteTransport[]>([]);
  const [roomArrangements, setRoomArrangements] = useState<RoomArrangement[]>([
    {
      id: '1',
      room_type: 'Double Sharing',
      occupancy: 2,
      number_of_rooms: 1,
      cost_per_room: 0,
      total_cost: 0
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set default valid until date (30 days from now)
    const defaultValidUntil = new Date();
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      valid_until: defaultValidUntil.toISOString().split('T')[0]
    }));
  }, []);

  const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const addHotel = () => {
    const newHotel: QuoteHotel = {
      id: Date.now().toString(),
      hotel_id: '',
      hotel_name: '',
      hotel_category: '',
      location: '',
      check_in: inquiry.travel_start,
      check_out: inquiry.travel_end,
      nights: calculateNights(inquiry.travel_start, inquiry.travel_end),
      room_type: '',
      meal_plan: '',
      cost_per_night: 0,
      total_cost: 0,
      is_primary: hotels.length === 0
    };
    setHotels([...hotels, newHotel]);
  };

  const updateHotel = (id: string, field: string, value: any) => {
    setHotels(hotels.map(hotel => {
      if (hotel.id === id) {
        const updated = { ...hotel, [field]: value };
        
        // Recalculate nights and total cost when dates change
        if (field === 'check_in' || field === 'check_out') {
          updated.nights = calculateNights(updated.check_in, updated.check_out);
          updated.total_cost = updated.nights * updated.cost_per_night;
        }
        
        // Recalculate total cost when cost per night changes
        if (field === 'cost_per_night') {
          updated.total_cost = updated.nights * value;
        }
        
        // Update hotel details when hotel is selected
        if (field === 'hotel_id') {
          const selectedHotel = mockHotels.find(h => h.id === value);
          if (selectedHotel) {
            updated.hotel_name = selectedHotel.name;
            updated.hotel_category = selectedHotel.category;
            updated.location = selectedHotel.location;
          }
        }
        
        return updated;
      }
      return hotel;
    }));
  };

  const removeHotel = (id: string) => {
    setHotels(hotels.filter(hotel => hotel.id !== id));
  };

  const addTransport = () => {
    const newTransport: QuoteTransport = {
      id: Date.now().toString(),
      transport_type: '',
      vendor_name: '',
      route: '',
      cost_per_person: 0,
      total_cost: 0
    };
    setTransport([...transport, newTransport]);
  };

  const updateTransport = (id: string, field: string, value: any) => {
    setTransport(transport.map(t => {
      if (t.id === id) {
        const updated = { ...t, [field]: value };
        
        // Recalculate total cost
        if (field === 'cost_per_person') {
          updated.total_cost = value * inquiry.number_of_guests;
        }
        
        return updated;
      }
      return t;
    }));
  };

  const removeTransport = (id: string) => {
    setTransport(transport.filter(t => t.id !== id));
  };

  const calculateSubtotal = () => {
    const hotelTotal = hotels.reduce((sum, hotel) => sum + hotel.total_cost, 0);
    const transportTotal = transport.reduce((sum, t) => sum + t.total_cost, 0);
    return hotelTotal + transportTotal;
  };

  const calculateMarkup = (subtotal: number) => {
    return (subtotal * formData.markup_percentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const markup = calculateMarkup(subtotal);
    return subtotal + markup;
  };

  const generateQuoteId = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QUO-${year}${month}-${random}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.inquiry_id) {
      newErrors.inquiry_id = 'Inquiry is required';
    }

    if (!formData.valid_until) {
      newErrors.valid_until = 'Valid until date is required';
    }

    if (hotels.length === 0) {
      newErrors.hotels = 'At least one hotel is required';
    }

    hotels.forEach((hotel, index) => {
      if (!hotel.hotel_id) {
        newErrors[`hotel_${index}_hotel_id`] = 'Hotel selection is required';
      }
      if (!hotel.room_type) {
        newErrors[`hotel_${index}_room_type`] = 'Room type is required';
      }
    });

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
      const quoteId = generateQuoteId();
      const subtotal = calculateSubtotal();
      const markupAmount = calculateMarkup(subtotal);
      const totalPrice = calculateTotal();

      const quoteData = {
        quote_id: quoteId,
        inquiry_id: formData.inquiry_id,
        client_name: inquiry.client_name,
        client_email: inquiry.client_email,
        destination: inquiry.destination,
        travel_start: inquiry.travel_start,
        travel_end: inquiry.travel_end,
        number_of_guests: inquiry.number_of_guests,
        hotels,
        transport,
        room_arrangements: roomArrangements,
        subtotal,
        markup_percentage: formData.markup_percentage,
        markup_amount: markupAmount,
        total_price: totalPrice,
        currency: 'USD',
        status: 'draft',
        valid_until: formData.valid_until,
        notes: formData.notes,
        created_by: profile?.id,
        org_id: profile?.org_id,
        created_at: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Creating quote:', quoteData);

      toast.success(`Quote ${quoteId} created successfully!`);
      navigate('/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const markupAmount = calculateMarkup(subtotal);
  const totalPrice = calculateTotal();

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
          <p className="text-gray-600 mt-1">Generate a detailed quote for client inquiry</p>
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
                <CardDescription>
                  Base information from the client inquiry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Inquiry ID</Label>
                    <Input value={inquiry.inquiry_id} disabled />
                  </div>
                  <div>
                    <Label>Client Name</Label>
                    <Input value={inquiry.client_name} disabled />
                  </div>
                  <div>
                    <Label>Destination</Label>
                    <Input value={inquiry.destination} disabled />
                  </div>
                  <div>
                    <Label>Number of Guests</Label>
                    <Input value={inquiry.number_of_guests} disabled />
                  </div>
                  <div>
                    <Label>Travel Start</Label>
                    <Input value={inquiry.travel_start} disabled />
                  </div>
                  <div>
                    <Label>Travel End</Label>
                    <Input value={inquiry.travel_end} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotels Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="h-5 w-5" />
                      Hotels & Accommodation
                    </CardTitle>
                    <CardDescription>
                      Add hotels and configure room arrangements
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addHotel} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hotel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {hotels.map((hotel, index) => (
                  <div key={hotel.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Hotel {index + 1}</h4>
                      {hotels.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeHotel(hotel.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Select Hotel</Label>
                        <Select
                          value={hotel.hotel_id}
                          onValueChange={(value) => updateHotel(hotel.id, 'hotel_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose hotel" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockHotels.map((h) => (
                              <SelectItem key={h.id} value={h.id}>
                                {h.name} ({h.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Room Type</Label>
                        <Select
                          value={hotel.room_type}
                          onValueChange={(value) => {
                            updateHotel(hotel.id, 'room_type', value);
                            // Update cost based on room type
                            const selectedHotel = mockHotels.find(h => h.id === hotel.hotel_id);
                            const roomType = selectedHotel?.room_types.find(rt => rt.name === value);
                            if (roomType) {
                              updateHotel(hotel.id, 'cost_per_night', roomType.cost_per_night);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose room type" />
                          </SelectTrigger>
                          <SelectContent>
                            {hotel.hotel_id && mockHotels.find(h => h.id === hotel.hotel_id)?.room_types.map((rt) => (
                              <SelectItem key={rt.name} value={rt.name}>
                                {rt.name} - ${rt.cost_per_night}/night
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Check-in Date</Label>
                        <Input
                          type="date"
                          value={hotel.check_in}
                          onChange={(e) => updateHotel(hotel.id, 'check_in', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Check-out Date</Label>
                        <Input
                          type="date"
                          value={hotel.check_out}
                          onChange={(e) => updateHotel(hotel.id, 'check_out', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Meal Plan</Label>
                        <Select
                          value={hotel.meal_plan}
                          onValueChange={(value) => updateHotel(hotel.id, 'meal_plan', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose meal plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {hotel.hotel_id && mockHotels.find(h => h.id === hotel.hotel_id)?.meal_plans.map((mp) => (
                              <SelectItem key={mp.type} value={mp.type}>
                                {mp.type} {mp.additional_cost > 0 && `(+$${mp.additional_cost}/night)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Cost per Night</Label>
                        <Input
                          type="number"
                          value={hotel.cost_per_night}
                          onChange={(e) => updateHotel(hotel.id, 'cost_per_night', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between text-sm">
                        <span>Nights: {hotel.nights}</span>
                        <span className="font-medium">Total: ${hotel.total_cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {hotels.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Hotel className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No hotels added yet. Click "Add Hotel" to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transport Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Transport & Transfers
                    </CardTitle>
                    <CardDescription>
                      Add flights, transfers, and other transport
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addTransport} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transport
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {transport.map((t, index) => (
                  <div key={t.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Transport {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTransport(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Transport Type</Label>
                        <Select
                          value={t.transport_type}
                          onValueChange={(value) => updateTransport(t.id, 'transport_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose transport" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockTransport.map((mt) => (
                              <SelectItem key={mt.id} value={mt.type}>
                                {mt.type} - {mt.route}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Route</Label>
                        <Input
                          value={t.route}
                          onChange={(e) => updateTransport(t.id, 'route', e.target.value)}
                          placeholder="From - To"
                        />
                      </div>
                      
                      <div>
                        <Label>Cost per Person</Label>
                        <Input
                          type="number"
                          value={t.cost_per_person}
                          onChange={(e) => updateTransport(t.id, 'cost_per_person', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div>
                        <Label>Total Cost</Label>
                        <Input value={`$${t.total_cost}`} disabled />
                      </div>
                    </div>
                  </div>
                ))}
                
                {transport.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Plane className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No transport added yet. Click "Add Transport" to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quote Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Quote Settings
                </CardTitle>
                <CardDescription>
                  Configure markup and validity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Markup Percentage</Label>
                    <Input
                      type="number"
                      value={formData.markup_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, markup_percentage: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Notes (Internal)</Label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows={3}
                    placeholder="Internal notes about this quote..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Markup ({formData.markup_percentage}%):</span>
                  <span className="font-medium text-blue-600">${markupAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Price:</span>
                    <span className="font-bold text-green-600 text-lg">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Price per person: ${(totalPrice / inquiry.number_of_guests).toFixed(2)}
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
                      Creating...
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

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Add multiple hotels for comparison</p>
                <p>• Include all transport costs</p>
                <p>• Set appropriate markup percentage</p>
                <p>• Double-check dates and pricing</p>
                <p>• Add internal notes for reference</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateQuotePage;