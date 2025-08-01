import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, MessageSquare, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';

const CreateInquiryPage = () => {
  const navigate = useNavigate();
  const { profile } = useSimpleAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_mobile: '',
    destination: '',
    tour_type: 'international' as 'domestic' | 'international',
    package_name: '',
    travel_start: '',
    travel_end: '',
    num_adults: 1,
    num_children: 0,
    children_with_bed: 0,
    children_no_bed: 0,
    num_rooms: 1,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [destinations] = useState([
    'Zanzibar, Tanzania', 'Serengeti National Park', 'Ngorongoro Crater', 'Mount Kilimanjaro',
    'Mombasa, Kenya', 'Maasai Mara', 'Lake Nakuru', 'Amboseli National Park', 'Nairobi City', 'Diani Beach'
  ]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Auto-calculate days and nights when dates change
  useEffect(() => {
    if (formData.travel_start && formData.travel_end) {
      const startDate = new Date(formData.travel_start);
      const endDate = new Date(formData.travel_end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setFormData(prev => ({
        ...prev,
        days_count: diffDays,
        nights_count: diffDays - 1
      }));
    }
  }, [formData.travel_start, formData.travel_end]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }

    if (!formData.client_email.trim()) {
      newErrors.client_email = 'Client email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.client_email)) {
      newErrors.client_email = 'Please enter a valid email address';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    if (!formData.travel_start) {
      newErrors.travel_start = 'Travel start date is required';
    }

    if (!formData.travel_end) {
      newErrors.travel_end = 'Travel end date is required';
    }

    if (formData.travel_start && formData.travel_end) {
      const startDate = new Date(formData.travel_start);
      const endDate = new Date(formData.travel_end);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        newErrors.travel_start = 'Travel start date cannot be in the past';
      }

      if (endDate <= startDate) {
        newErrors.travel_end = 'Travel end date must be after start date';
      }
    }

    if (formData.num_adults < 1) {
      newErrors.num_adults = 'Number of adults must be at least 1';
    }

    if (formData.num_rooms < 1) {
      newErrors.num_rooms = 'Number of rooms must be at least 1';
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
      // Calculate days and nights
      const startDate = new Date(formData.travel_start);
      const endDate = new Date(formData.travel_end);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const nights = days - 1;

      const inquiryData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_mobile: formData.client_mobile,
        destination: formData.destination,
        tour_type: formData.tour_type,
        package_name: formData.package_name || null,
        check_in_date: formData.travel_start,
        check_out_date: formData.travel_end,
        days_count: days,
        nights_count: nights,
        adults: formData.num_adults,
        children: formData.num_children,
        infants: 0,
        children_with_bed: formData.children_with_bed,
        children_no_bed: formData.children_no_bed,
        special_requirements: formData.notes,
        created_by: profile?.id,
        org_id: profile?.org_id
      };

      const { data, error } = await supabase
        .from('inquiries')
        .insert(inquiryData as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success(`Inquiry ${data.enquiry_number} created successfully!`);
      navigate(`/quotes/create?inquiry=${data.id}`);
    } catch (error) {
      console.error('Error creating inquiry:', error);
      toast.error('Failed to create inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalGuests = formData.num_adults + formData.num_children;
  const calculatedDays = formData.travel_start && formData.travel_end ? 
    Math.ceil((new Date(formData.travel_end).getTime() - new Date(formData.travel_start).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const calculatedNights = calculatedDays > 0 ? calculatedDays - 1 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/inquiries">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inquiries
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Inquiry</h1>
          <p className="text-gray-600 mt-1">Start a new travel inquiry for your client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Client Information
                </CardTitle>
                <CardDescription>
                  Enter the client's contact details and travel preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">
                      Client Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="client_name"
                      placeholder="John Doe"
                      value={formData.client_name}
                      onChange={(e) => handleInputChange('client_name', e.target.value)}
                      className={errors.client_name ? 'border-red-500' : ''}
                    />
                    {errors.client_name && (
                      <p className="text-sm text-red-600">{errors.client_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="client_email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.client_email}
                      onChange={(e) => handleInputChange('client_email', e.target.value)}
                      className={errors.client_email ? 'border-red-500' : ''}
                    />
                    {errors.client_email && (
                      <p className="text-sm text-red-600">{errors.client_email}</p>
                    )}
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_mobile">
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="client_mobile"
                      placeholder="+254-700-000000"
                      value={formData.client_mobile}
                      onChange={(e) => handleInputChange('client_mobile', e.target.value)}
                    />
                  </div>
              </CardContent>
            </Card>

            {/* Travel Details */}
            <Card>
              <CardHeader>
                <CardTitle>Travel Details</CardTitle>
                <CardDescription>
                  Specify the travel destination, dates, and group size
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tour_type">Tour Type</Label>
                    <Select
                      value={formData.tour_type}
                      onValueChange={(value: 'domestic' | 'international') => 
                        handleInputChange('tour_type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic Tour</SelectItem>
                        <SelectItem value="international">International Tour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="package_name">Package Name (Optional)</Label>
                    <Input
                      id="package_name"
                      placeholder="Safari Adventure Package"
                      value={formData.package_name}
                      onChange={(e) => handleInputChange('package_name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">
                    Destination <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="destination"
                    placeholder="Enter destination"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    className={errors.destination ? 'border-red-500' : ''}
                    list="destinations"
                  />
                  <datalist id="destinations">
                    {destinations.map((dest) => (
                      <option key={dest} value={dest} />
                    ))}
                  </datalist>
                  {errors.destination && (
                    <p className="text-sm text-red-600">{errors.destination}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="travel_start">
                      Travel Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="travel_start"
                      type="date"
                      value={formData.travel_start}
                      onChange={(e) => handleInputChange('travel_start', e.target.value)}
                      className={errors.travel_start ? 'border-red-500' : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.travel_start && (
                      <p className="text-sm text-red-600">{errors.travel_start}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travel_end">
                      Travel End Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="travel_end"
                      type="date"
                      value={formData.travel_end}
                      onChange={(e) => handleInputChange('travel_end', e.target.value)}
                      className={errors.travel_end ? 'border-red-500' : ''}
                      min={formData.travel_start || new Date().toISOString().split('T')[0]}
                    />
                    {errors.travel_end && (
                      <p className="text-sm text-red-600">{errors.travel_end}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Auto-calculated Duration
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-gray-50 rounded border text-center">
                        <div className="text-lg font-semibold text-teal-600">{calculatedDays}</div>
                        <div className="text-xs text-gray-600">Days</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded border text-center">
                        <div className="text-lg font-semibold text-teal-600">{calculatedNights}</div>
                        <div className="text-xs text-gray-600">Nights</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="num_adults">
                      Adults <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="num_adults"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.num_adults}
                      onChange={(e) => handleInputChange('num_adults', parseInt(e.target.value) || 1)}
                      className={errors.num_adults ? 'border-red-500' : ''}
                    />
                    {errors.num_adults && (
                      <p className="text-sm text-red-600">{errors.num_adults}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="num_children">Children</Label>
                    <Input
                      id="num_children"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.num_children}
                      onChange={(e) => handleInputChange('num_children', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="children_with_bed">Children with Bed</Label>
                    <Input
                      id="children_with_bed"
                      type="number"
                      min="0"
                      max={formData.num_children}
                      value={formData.children_with_bed}
                      onChange={(e) => handleInputChange('children_with_bed', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="children_no_bed">Children without Bed</Label>
                    <Input
                      id="children_no_bed"
                      type="number"
                      min="0"
                      max={formData.num_children}
                      value={formData.children_no_bed}
                      onChange={(e) => handleInputChange('children_no_bed', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num_rooms">
                    Number of Rooms <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="num_rooms"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.num_rooms}
                    onChange={(e) => handleInputChange('num_rooms', parseInt(e.target.value) || 1)}
                    className={errors.num_rooms ? 'border-red-500' : ''}
                  />
                  {errors.num_rooms && (
                    <p className="text-sm text-red-600">{errors.num_rooms}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <textarea
                    id="notes"
                    placeholder="Any special requirements, preferences, or notes..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Inquiry Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">
                    {formData.client_name || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">
                    {formData.destination || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tour Type:</span>
                  <span className="font-medium capitalize">
                    {formData.tour_type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Guests:</span>
                  <span className="font-medium">
                    {totalGuests} ({formData.num_adults} adults, {formData.num_children} children)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rooms:</span>
                  <span className="font-medium">
                    {formData.num_rooms}
                  </span>
                </div>
                {calculatedDays > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {calculatedDays} days / {calculatedNights} nights
                    </span>
                  </div>
                )}
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
                      Create Inquiry & Generate Quote
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/inquiries')}
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
                <p>• Double-check client contact information</p>
                <p>• Include specific destination details</p>
                <p>• Note any special requirements early</p>
                <p>• Verify travel dates are realistic</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateInquiryPage;