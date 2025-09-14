import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/quoteCalculations';
import type { TransportOption } from '@/types/quote';

interface TransportBuilderProps {
  transportOptions: TransportOption[];
  onTransportOptionsChange: (options: TransportOption[]) => void;
  currencyCode: string;
  numPassengers: number;
}

export const TransportBuilder: React.FC<TransportBuilderProps> = ({
  transportOptions,
  onTransportOptionsChange,
  currencyCode,
  numPassengers
}) => {
  const addTransportOption = () => {
    const newOption: TransportOption = {
      id: `transport_${Date.now()}`,
      type: '',
      route: '',
      cost_per_person: 0,
      total_passengers: numPassengers,
      total_cost: 0
    };
    onTransportOptionsChange([...transportOptions, newOption]);
  };

  const updateTransportOption = (index: number, updates: Partial<TransportOption>) => {
    const updated = transportOptions.map((option, i) => {
      if (i === index) {
        const updatedOption = { ...option, ...updates };
        // Recalculate total cost
        updatedOption.total_cost = updatedOption.cost_per_person * updatedOption.total_passengers;
        return updatedOption;
      }
      return option;
    });
    onTransportOptionsChange(updated);
  };

  const removeTransportOption = (index: number) => {
    onTransportOptionsChange(transportOptions.filter((_, i) => i !== index));
  };

  const getTotalCost = () => {
    return transportOptions.reduce((total, option) => total + option.total_cost, 0);
  };

  const transportTypes = [
    'Flight',
    'Bus',
    'Train',
    'Private Vehicle',
    'Rental Car',
    'Boat/Ferry',
    'Helicopter',
    'Other'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transport Options
          <Badge variant="secondary">
            Total: {formatCurrency(getTotalCost(), currencyCode)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transportOptions.map((option, index) => (
          <Card key={option.id || index} className="border-dashed">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Transport Type</Label>
                  <Select
                    value={option.type}
                    onValueChange={(value) => updateTransportOption(index, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transport type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transportTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Route Details</Label>
                  <Input
                    value={option.route}
                    onChange={(e) => updateTransportOption(index, { route: e.target.value })}
                    placeholder="e.g., Nairobi - Masai Mara"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Passengers</Label>
                  <Input
                    type="number"
                    min="1"
                    value={option.total_passengers}
                    onChange={(e) => updateTransportOption(index, { total_passengers: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cost per Person</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={option.cost_per_person}
                    onChange={(e) => updateTransportOption(index, { cost_per_person: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Cost</Label>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">
                    {formatCurrency(option.total_cost, currencyCode)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTransportOption(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addTransportOption}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transport Option
        </Button>
      </CardContent>
    </Card>
  );
};