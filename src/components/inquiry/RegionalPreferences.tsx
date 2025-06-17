
import React from 'react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useOrganizationSettings } from '../../hooks/useOrganizationSettings';

interface RegionalPreferencesProps {
  value: string;
  onChange: (value: string) => void;
  tourType: 'domestic' | 'international';
}

const RegionalPreferences: React.FC<RegionalPreferencesProps> = ({
  value,
  onChange,
  tourType
}) => {
  const { settings, loading } = useOrganizationSettings();

  if (tourType !== 'domestic') return null;

  const regions = settings?.default_regions || ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  const country = settings?.default_country || 'Kenya';

  if (loading) {
    return (
      <div>
        <Label htmlFor="regional_preference">Regional Preference</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading regions..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="regional_preference">Regional Preference ({country})</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
};

export default RegionalPreferences;
