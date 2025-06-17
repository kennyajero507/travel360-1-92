
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tour, TourFormData } from "../../types/tour.types";
import { ArrowLeft, Save } from "lucide-react";

interface TourFormProps {
  tour?: Tour;
  onSave: (data: TourFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TourForm: React.FC<TourFormProps> = ({ tour, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<TourFormData>({
    title: '',
    destination_name: '',
    country: 'Kenya',
    region: '',
    duration_days: 1,
    duration_nights: 0,
    tour_type: 'domestic',
    description: '',
    inclusions: [],
    exclusions: [],
    base_price: 0,
    currency_code: 'KES',
    itinerary: [],
    images: [],
    tags: []
  });

  useEffect(() => {
    if (tour) {
      setFormData({
        title: tour.title,
        destination_name: tour.destination_name,
        country: tour.country,
        region: tour.region || '',
        duration_days: tour.duration_days,
        duration_nights: tour.duration_nights,
        tour_type: tour.tour_type,
        description: tour.description || '',
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        base_price: tour.base_price || 0,
        currency_code: tour.currency_code,
        itinerary: tour.itinerary,
        images: tour.images,
        tags: tour.tags
      });
    }
  }, [tour]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof TourFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tours
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{tour ? 'Edit Tour' : 'Create New Tour'}</h2>
          <p className="text-gray-600">Set up your tour package details and itinerary</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Tour Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter tour title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="destination_name">Destination</Label>
                <Input
                  id="destination_name"
                  value={formData.destination_name}
                  onChange={(e) => handleInputChange('destination_name', e.target.value)}
                  placeholder="Enter destination"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration_days">Duration (Days)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => handleInputChange('duration_days', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration_nights">Duration (Nights)</Label>
                <Input
                  id="duration_nights"
                  type="number"
                  min="0"
                  value={formData.duration_nights}
                  onChange={(e) => handleInputChange('duration_nights', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">Base Price</Label>
                <Input
                  id="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="currency_code">Currency</Label>
                <Input
                  id="currency_code"
                  value={formData.currency_code}
                  onChange={(e) => handleInputChange('currency_code', e.target.value)}
                  placeholder="e.g., KES, USD"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Tour'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TourForm;
