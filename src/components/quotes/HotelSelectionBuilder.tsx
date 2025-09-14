import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/quoteCalculations';
import type { SleepingArrangement } from '@/types/quote';
import { useHotels } from '@/hooks/useHotels';

interface HotelSelectionBuilderProps {
  sleepingArrangements: SleepingArrangement[];
  onSleepingArrangementsChange: (arrangements: SleepingArrangement[]) => void;
  currencyCode: string;
  duration: number;
}

export const HotelSelectionBuilder: React.FC<HotelSelectionBuilderProps> = ({
  sleepingArrangements,
  onSleepingArrangementsChange,
  currencyCode,
  duration
}) => {
  const { hotels, loading } = useHotels();

  const addArrangement = () => {
    const newArrangement: SleepingArrangement = {
      id: `arr_${Date.now()}`,
      room_number: 1,
      adults: 2,
      children_with_bed: 0,
      children_no_bed: 0,
      room_type: 'Standard',
      cost_per_night: 0
    };
    onSleepingArrangementsChange([...sleepingArrangements, newArrangement]);
  };

  const updateArrangement = (index: number, updates: Partial<SleepingArrangement>) => {
    const updated = sleepingArrangements.map((arr, i) => {
      if (i === index) {
        return { ...arr, ...updates };
      }
      return arr;
    });
    onSleepingArrangementsChange(updated);
  };

  const removeArrangement = (index: number) => {
    onSleepingArrangementsChange(sleepingArrangements.filter((_, i) => i !== index));
  };

  const getTotalCost = () => {
    return sleepingArrangements.reduce((total, arr) => total + (arr.cost_per_night * duration), 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Hotel & Accommodation
          <Badge variant="secondary">
            Total: {formatCurrency(getTotalCost(), currencyCode)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sleepingArrangements.map((arrangement, index) => (
          <Card key={arrangement.id || index} className="border-dashed">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Input
                    value={arrangement.room_type}
                    onChange={(e) => updateArrangement(index, { room_type: e.target.value })}
                    placeholder="e.g., Standard Double"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input
                    type="number"
                    min="1"
                    value={arrangement.room_number}
                    onChange={(e) => updateArrangement(index, { room_number: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cost per Night</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={arrangement.cost_per_night}
                    onChange={(e) => updateArrangement(index, { cost_per_night: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <Input
                    type="number"
                    min="1"
                    value={arrangement.adults}
                    onChange={(e) => updateArrangement(index, { adults: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Children with Bed</Label>
                  <Input
                    type="number"
                    min="0"
                    value={arrangement.children_with_bed}
                    onChange={(e) => updateArrangement(index, { children_with_bed: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Children no Bed</Label>
                  <Input
                    type="number"
                    min="0"
                    value={arrangement.children_no_bed}
                    onChange={(e) => updateArrangement(index, { children_no_bed: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total per Night</Label>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {formatCurrency(arrangement.cost_per_night * duration, currencyCode)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrangement(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addArrangement}
          className="w-full"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hotel Arrangement
        </Button>
      </CardContent>
    </Card>
  );
};