
import React from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Building } from 'lucide-react';

interface HotelComparisonToggleProps {
  isComparisonMode: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

const HotelComparisonToggle: React.FC<HotelComparisonToggleProps> = ({
  isComparisonMode,
  onToggle,
  disabled = false
}) => {
  const handleToggle = (checked: boolean) => {
    onToggle(checked);
    // Add any additional logic needed when toggling comparison mode
    if (checked) {
      console.log('Hotel comparison mode enabled');
    } else {
      console.log('Single hotel mode enabled');
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isComparisonMode ? (
              <Building className="h-5 w-5 text-blue-600" />
            ) : (
              <Building className="h-5 w-5 text-gray-600" />
            )}
            <div>
              <Label htmlFor="comparison-mode" className="text-sm font-medium">
                {isComparisonMode ? 'Hotel Comparison Mode' : 'Single Hotel Mode'}
              </Label>
              <p className="text-xs text-gray-500">
                {isComparisonMode 
                  ? 'Compare multiple hotel options for the client'
                  : 'Select one hotel for the quote'
                }
              </p>
            </div>
          </div>
          <Switch
            id="comparison-mode"
            checked={isComparisonMode}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelComparisonToggle;
