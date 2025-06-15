
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { InquiryFormProps } from "../../types/inquiry.types";

export const DomesticSpecificCard = ({ formData, setFormData, validationErrors }: InquiryFormProps) => {
  const regionalPreferences = [
    { value: 'north', label: 'North India' },
    { value: 'south', label: 'South India' },
    { value: 'east', label: 'East India' },
    { value: 'west', label: 'West India' },
    { value: 'central', label: 'Central India' },
    { value: 'northeast', label: 'Northeast India' }
  ];

  const transportModes = [
    { value: 'flight', label: 'Flight' },
    { value: 'train', label: 'Train' },
    { value: 'bus', label: 'Bus/Coach' },
    { value: 'car', label: 'Private Car' },
    { value: 'mixed', label: 'Mixed Transport' }
  ];

  const languages = [
    { value: 'hindi', label: 'Hindi' },
    { value: 'english', label: 'English' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'gujarati', label: 'Gujarati' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'malayalam', label: 'Malayalam' },
    { value: 'punjabi', label: 'Punjabi' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domestic Tour Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regional Preference */}
          <div className="space-y-2">
            <Label htmlFor="regional_preference">Regional Preference</Label>
            <Select
              value={formData.regional_preference}
              onValueChange={(value) =>
                setFormData({ ...formData, regional_preference: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regionalPreferences.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
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
                {languages.map((lang) => (
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
