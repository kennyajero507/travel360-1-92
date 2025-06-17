
import React from 'react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCountry } from '../../contexts/CountryContext';

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
  const { regions, country } = useCountry();

  if (tourType !== 'domestic') return null;

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
