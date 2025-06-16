
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
import { TourTemplate, TourTemplateFormData, ItineraryDay } from "../../types/tour.types";
import { tourTemplateService } from "../../services/tourTemplateService";
import ItineraryBuilder from "./ItineraryBuilder";

interface TourTemplateFormProps {
  template?: TourTemplate;
  onSave: (data: TourTemplateFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const TourTemplateForm: React.FC<TourTemplateFormProps> = ({ 
  template, 
  onSave, 
  onCancel, 
  isLoading 
}) => {
  const [formData, setFormData] = useState<TourTemplateFormData>({
    title: '',
    destination_name: '',
    country: 'Kenya',
    region: '',
    duration_days: 3,
    duration_nights: 2,
    tour_type: 'domestic',
    description: '',
    inclusions: [],
    exclusions: [],
    base_price: undefined,
    currency_code: 'KES',
    itinerary: [],
    images: [],
    tags: []
  });

  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newTag, setNewTag] = useState('');

  const kenyaRegions = tourTemplateService.getKenyaRegions();
  const commonTags = tourTemplateService.getTourTags();

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        destination_name: template.destination_name,
        country: template.country,
        region: template.region || '',
        duration_days: template.duration_days,
        duration_nights: template.duration_nights,
        tour_type: template.tour_type,
        description: template.description || '',
        inclusions: template.inclusions,
        exclusions: template.exclusions,
        base_price: template.base_price,
        currency_code: template.currency_code,
        itinerary: template.itinerary,
        images: template.images,
        tags: template.tags
      });
    }
  }, [template]);

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
              {template ? 'Edit Tour Template' : 'Create Tour Template'}
            </h2>
            <p className="text-gray-600">Set up destination, package details, and itinerary</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Template'}
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
                    <Label htmlFor="title">Template Title *</Label>
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
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="Tanzania">Tanzania</SelectItem>
                        <SelectItem value="Uganda">Uganda</SelectItem>
                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="region">Region</Label>
                    {formData.country === 'Kenya' ? (
                      <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {kenyaRegions.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                        placeholder="Enter region"
                      />
                    )}
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
                          <SelectItem value="KES">KES</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
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

export default TourTemplateForm;
