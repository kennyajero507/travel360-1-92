
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { X, Plus, ArrowLeft, Save } from "lucide-react";
import { Tour, TourFormData, ItineraryDay } from "../../types/tour.types";
import { tourService } from "../../services/tourService";
import { useOrganizationSettings } from "../../hooks/useOrganizationSettings";
import ItineraryBuilder from "./ItineraryBuilder";

interface TourFormProps {
  tour?: Tour;
  onSave: (data: TourFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const TourForm: React.FC<TourFormProps> = ({ 
  tour, 
  onSave, 
  onCancel, 
  isLoading 
}) => {
  const { settings } = useOrganizationSettings();
  const [formData, setFormData] = useState<TourFormData>({
    title: '',
    destination_name: '',
    country: settings?.default_country || 'Kenya',
    region: '',
    duration_days: 3,
    duration_nights: 2,
    tour_type: 'domestic',
    description: '',
    inclusions: [],
    exclusions: [],
    base_price: undefined,
    currency_code: settings?.default_currency || 'KES',
    itinerary: [],
    images: [],
    tags: []
  });

  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newTag, setNewTag] = useState('');

  const regions = settings?.default_regions || tourService.getKenyaRegions();
  const commonTags = tourService.getTourTags();

  const currencies = [
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'TZS', name: 'Tanzanian Shilling' },
    { code: 'UGX', name: 'Ugandan Shilling' }
  ];

  const countries = [
    { code: 'Kenya', name: 'Kenya' },
    { code: 'Tanzania', name: 'Tanzania' },
    { code: 'Uganda', name: 'Uganda' },
    { code: 'Rwanda', name: 'Rwanda' },
    { code: 'Ethiopia', name: 'Ethiopia' }
  ];

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
        base_price: tour.base_price,
        currency_code: tour.currency_code,
        itinerary: tour.itinerary,
        images: tour.images,
        tags: tour.tags
      });
    }
  }, [tour]);

  // Auto-calculate nights when days change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      duration_nights: Math.max(0, prev.duration_days - 1)
    }));
  }, [formData.duration_days]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const addInclusion = () => {
    if (newInclusion.trim()) {
      setFormData(prev => ({
        ...prev,
        inclusions: [...prev.inclusions, newInclusion.trim()]
      }));
      setNewInclusion('');
    }
  };

  const removeInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setFormData(prev => ({
        ...prev,
        exclusions: [...prev.exclusions, newExclusion.trim()]
      }));
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addCustomTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {tour ? 'Edit Tour' : 'Create Tour'}
            </h2>
            <p className="text-gray-600">Set up destination, package details, and itinerary</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Tour'}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="destination" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="destination">Destination Details</TabsTrigger>
            <TabsTrigger value="package">Package Information</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary Builder</TabsTrigger>
          </TabsList>

          {/* Step 1: Destination Details */}
          <TabsContent value="destination">
            <Card>
              <CardHeader>
                <CardTitle>Destination Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Tour Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., 3-Day Maasai Mara Safari"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="destination_name">Destination Name *</Label>
                    <Input
                      id="destination_name"
                      value={formData.destination_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination_name: e.target.value }))}
                      placeholder="e.g., Maasai Mara"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tour_type">Tour Type *</Label>
                    <Select value={formData.tour_type} onValueChange={(value: 'domestic' | 'international') => setFormData(prev => ({ ...prev, tour_type: value }))}>
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

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the tour experience..."
                    rows={3}
                  />
                </div>

                {/* Tags Section */}
                <div>
                  <Label>Tags</Label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {commonTags.map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant={formData.tags.includes(tag) ? "default" : "outline"}
                          size="sm"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                      />
                      <Button type="button" onClick={addCustomTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeTag(index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Package Information */}
          <TabsContent value="package">
            <Card>
              <CardHeader>
                <CardTitle>Package Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="duration_days">Duration (Days) *</Label>
                    <Input
                      id="duration_days"
                      type="number"
                      min="1"
                      value={formData.duration_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 1 }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_nights: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="base_price">Base Price</Label>
                    <div className="flex gap-2">
                      <Select value={formData.currency_code} onValueChange={(value) => setFormData(prev => ({ ...prev, currency_code: value }))}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>{curr.code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="base_price"
                        type="number"
                        min="0"
                        value={formData.base_price || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Inclusions */}
                <div>
                  <Label>Inclusions</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add inclusion..."
                        value={newInclusion}
                        onChange={(e) => setNewInclusion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
                      />
                      <Button type="button" onClick={addInclusion}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {formData.inclusions.length > 0 && (
                      <div className="space-y-2">
                        {formData.inclusions.map((inclusion, index) => (
                          <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                            <span className="text-sm">{inclusion}</span>
                            <X 
                              className="h-4 w-4 cursor-pointer text-red-500" 
                              onClick={() => removeInclusion(index)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Exclusions */}
                <div>
                  <Label>Exclusions</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add exclusion..."
                        value={newExclusion}
                        onChange={(e) => setNewExclusion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
                      />
                      <Button type="button" onClick={addExclusion}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {formData.exclusions.length > 0 && (
                      <div className="space-y-2">
                        {formData.exclusions.map((exclusion, index) => (
                          <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                            <span className="text-sm">{exclusion}</span>
                            <X 
                              className="h-4 w-4 cursor-pointer text-red-500" 
                              onClick={() => removeExclusion(index)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Itinerary Builder */}
          <TabsContent value="itinerary">
            <ItineraryBuilder
              itinerary={formData.itinerary}
              duration={formData.duration_days}
              onChange={(itinerary) => setFormData(prev => ({ ...prev, itinerary }))}
            />
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
};

export default TourForm;
