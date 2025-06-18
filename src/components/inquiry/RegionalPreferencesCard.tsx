
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { InquiryFormProps } from "../../types/inquiry.types";
import { useOrganizationSettings } from "../../hooks/useOrganizationSettings";

export const RegionalPreferencesCard = ({ formData, setFormData }: InquiryFormProps) => {
  const { settings, loading } = useOrganizationSettings();

  if (formData.tour_type !== 'domestic') return null;

  const regions = settings?.default_regions || ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  const country = settings?.default_country || 'Kenya';

  const transportModes = [
    { value: 'flight', label: 'Flight' },
    { value: 'bus', label: 'Bus/Coach' },
    { value: 'car', label: 'Private Car' },
    { value: 'mixed', label: 'Mixed Transport' }
  ];

  const guideLanguages = [
    { value: 'english', label: 'English' },
    { value: 'swahili', label: 'Swahili' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regional Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 h-10 w-full rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domestic Tour Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regional Preference */}
          <div className="space-y-2">
            <Label htmlFor="regional_preference">Regional Preference ({country})</Label>
            <Select
              value={formData.regional_preference}
              onValueChange={(value) =>
                setFormData({ ...formData, regional_preference: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${country} region`} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transport Mode Preference */}
          <div className="space-y-2">
            <Label htmlFor="transport_mode_preference">Transport Mode Preference</Label>
            <Select
              value={formData.transport_mode_preference}
              onValueChange={(value) =>
                setFormData({ ...formData, transport_mode_preference: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transport mode" />
              </SelectTrigger>
              <SelectContent>
                {transportModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guide Language Preference */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="guide_language_preference">Guide Language Preference</Label>
            <Select
              value={formData.guide_language_preference}
              onValueChange={(value) =>
                setFormData({ ...formData, guide_language_preference: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preferred language" />
              </SelectTrigger>
              <SelectContent>
                {guideLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
