import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateInquiryPage = () => {
  const navigate = useNavigate();
  const { profile } = useSimpleAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    destination: '',
    travel_type: 'international' as 'domestic' | 'international',
    travel_start: '',
    travel_end: '',
    number_of_guests: 1,
    special_requests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

    if (formData.number_of_guests < 1) {
      newErrors.number_of_guests = 'Number of guests must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateInquiryId = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ENQ-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Generate inquiry ID
      const inquiryId = generateInquiryId();

      // Here you would typically save to your database
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const inquiryData = {
        ...formData,
        inquiry_id: inquiryId,
        status: 'new',
        created_by: profile?.id,
        org_id: profile?.org_id,
        created_at: new Date().toISOString()
      };

      console.log('Creating inquiry:', inquiryData);

      toast.success(`Inquiry ${inquiryId} created successfully!`);
      navigate('/inquiries');
    } catch (error) {
      console.error('Error creating inquiry:', error);
      toast.error('Failed to create inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const popularDestinations = [
    'Zanzibar, Tanzania',
    'Serengeti National Park',
    'Ngorongoro Crater',
    'Mount Kilimanjaro',
    'Mombasa, Kenya',
    'Maasai Mara',
    'Lake Nakuru',
    'Amboseli National Park',
    'Nairobi City',
    'Diani Beach'
  ];

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
                  <Label htmlFor="client_phone">Phone Number</Label>
                  <Input
                    id="client_phone"
                    placeholder="+1-555-0123"
                    value={formData.client_phone}
                    onChange={(e) => handleInputChange('client_phone', e.target.value)}
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
                      {popularDestinations.map((dest) => (
                        <option key={dest} value={dest} />
                      ))}
                    </datalist>
                    {errors.destination && (
                      <p className="text-sm text-red-600">{errors.destination}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travel_type">Travel Type</Label>
                    <Select
                      value={formData.travel_type}
                      onValueChange={(value: 'domestic' | 'international') => 
                        handleInputChange('travel_type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Label htmlFor="number_of_guests">
                      Number of Guests <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="number_of_guests"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.number_of_guests}
                      onChange={(e) => handleInputChange('number_of_guests', parseInt(e.target.value) || 1)}
                      className={errors.number_of_guests ? 'border-red-500' : ''}
                    />
                    {errors.number_of_guests && (
                      <p className="text-sm text-red-600">{errors.number_of_guests}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="special_requests">Special Requests</Label>
                  <textarea
                    id="special_requests"
                    placeholder="Any special requirements, preferences, or notes..."
                    value={formData.special_requests}
                    onChange={(e) => handleInputChange('special_requests', e.target.value)}
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
                  <span className="text-gray-600">Travel Type:</span>
                  <span className="font-medium capitalize">
                    {formData.travel_type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">
                    {formData.number_of_guests}
                  </span>
                </div>
                {formData.travel_start && formData.travel_end && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {Math.ceil((new Date(formData.travel_end).getTime() - new Date(formData.travel_start).getTime()) / (1000 * 60 * 60 * 24))} days
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
                      Create Inquiry
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