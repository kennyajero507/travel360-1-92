
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { User, MapPin, Phone, Calendar, Users, BedDouble } from "lucide-react";
import { useInquiryForm } from "../../hooks/useInquiryForm";

export const SimplifiedInquiryForm = () => {
  const {
    formData,
    setFormData,
    validationErrors,
    isSubmitting,
    handleSubmit,
    saveDraft,
    handleCancel
  } = useInquiryForm();

  // Auto-calculate duration
  const calculateDuration = () => {
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const nights = days > 0 ? days - 1 : 0;
      return { days, nights };
    }
    return { days: 0, nights: 0 };
  };

  const { days, nights } = calculateDuration();

  const leadSources = [
    'Website', 'Agent Referral', 'Social Media', 'Walk-in', 'Phone Call', 'Email', 'Advertisement'
  ];

  const budgetRanges = [
    'Under KSh 50,000',
    'KSh 50,000 - 100,000',
    'KSh 100,000 - 200,000',
    'KSh 200,000 - 500,000',
    'Above KSh 500,000'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Block 1: Client & Travel Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            🔶 Block 1: Client & Travel Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="client_name">Client Name *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Enter client name"
                className={`bg-white text-black ${
                  validationErrors.some(error => error.includes('Client name')) 
                    ? 'border-red-500' : ''
                }`}
              />
            </div>

            <div>
              <Label htmlFor="client_email">Email Address</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                placeholder="Email address"
                className="bg-white text-black"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="client_mobile">Mobile Number *</Label>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-gray-500" />
              <Input
                id="client_mobile"
                value={formData.client_mobile}
                onChange={(e) => setFormData({ ...formData, client_mobile: e.target.value })}
                placeholder="Mobile phone number"
                className={`bg-white text-black ${
                  validationErrors.some(error => error.includes('Client mobile')) 
                    ? 'border-red-500' : ''
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="adults" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Adults *
              </Label>
              <Input
                id="adults"
                type="number"
                min="1"
                value={formData.adults}
                onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                className="bg-white text-black"
              />
            </div>

            <div>
              <Label htmlFor="children">Children</Label>
              <Input
                id="children"
                type="number"
                min="0"
                value={formData.children}
                onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                className="bg-white text-black"
              />
            </div>

            <div>
              <Label htmlFor="infants">Infants</Label>
              <Input
                id="infants"
                type="number"
                min="0"
                value={formData.infants}
                onChange={(e) => setFormData({ ...formData, infants: parseInt(e.target.value) || 0 })}
                className="bg-white text-black"
              />
            </div>

            <div>
              <Label htmlFor="num_rooms" className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                Rooms *
              </Label>
              <Input
                id="num_rooms"
                type="number"
                min="1"
                value={formData.num_rooms}
                onChange={(e) => setFormData({ ...formData, num_rooms: parseInt(e.target.value) || 1 })}
                className="bg-white text-black"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block 2: Destination Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-green-600" />
            🔶 Block 2: Destination Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tour Type Toggle */}
          <div>
            <Label>Tour Type</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={formData.tour_type === 'domestic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, tour_type: 'domestic' })}
              >
                Domestic
              </Button>
              <Button
                type="button"
                variant={formData.tour_type === 'international' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, tour_type: 'international' })}
              >
                International
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Enter destination"
                className={`bg-white text-black ${
                  validationErrors.some(error => error.includes('Destination')) 
                    ? 'border-red-500' : ''
                }`}
              />
            </div>

            <div>
              <Label htmlFor="package_name">Package</Label>
              <Input
                id="package_name"
                value={formData.package_name}
                onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                placeholder="Enter package name"
                className="bg-white text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="check_in_date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Check-in Date *
              </Label>
              <Input
                id="check_in_date"
                type="date"
                value={formData.check_in_date}
                onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                className={`bg-white text-black ${
                  validationErrors.some(error => error.includes('Check-in date')) 
                    ? 'border-red-500' : ''
                }`}
              />
            </div>

            <div>
              <Label htmlFor="check_out_date">Check-out Date *</Label>
              <Input
                id="check_out_date"
                type="date"
                value={formData.check_out_date}
                onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                className={`bg-white text-black ${
                  validationErrors.some(error => error.includes('Check-out date')) 
                    ? 'border-red-500' : ''
                }`}
              />
            </div>
          </div>

          {/* Duration Display */}
          {(days > 0 || nights > 0) && (
            <div className="flex gap-4">
              <Badge variant="outline" className="px-3 py-1">
                Duration: {days} Day{days !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {nights} Night{nights !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="estimated_budget_range">Estimated Budget Range</Label>
              <Select
                value={formData.estimated_budget_range}
                onValueChange={(value) => setFormData({ ...formData, estimated_budget_range: value })}
              >
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="lead_source">Lead Source</Label>
              <Select
                value={formData.lead_source}
                onValueChange={(value) => setFormData({ ...formData, lead_source: value })}
              >
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tour_consultant">Tour Consultant</Label>
              <Input
                id="tour_consultant"
                value={formData.tour_consultant}
                onChange={(e) => setFormData({ ...formData, tour_consultant: e.target.value })}
                placeholder="Consultant name"
                className="bg-white text-black"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              value={formData.special_requirements}
              onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
              placeholder="e.g. dietary requirements, mobility needs, special occasions, etc."
              className="bg-white text-black min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h4 className="text-red-800 font-medium">Please fix the following errors:</h4>
              {validationErrors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm">• {error}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button 
          type="button" 
          variant="secondary" 
          onClick={saveDraft}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save as Draft'}
        </Button>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
        </Button>
      </div>
    </form>
  );
};
