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
import type { TransferOption } from '@/types/quote';

interface TransferBuilderProps {
  transferOptions: TransferOption[];
  onTransferOptionsChange: (options: TransferOption[]) => void;
  currencyCode: string;
  numPassengers: number;
}

export const TransferBuilder: React.FC<TransferBuilderProps> = ({
  transferOptions,
  onTransferOptionsChange,
  currencyCode,
  numPassengers
}) => {
  const addTransferOption = () => {
    const newOption: TransferOption = {
      id: `transfer_${Date.now()}`,
      type: '',
      route: '',
      cost_per_person: 0,
      total_passengers: numPassengers,
      total_cost: 0
    };
    onTransferOptionsChange([...transferOptions, newOption]);
  };

  const updateTransferOption = (index: number, updates: Partial<TransferOption>) => {
    const updated = transferOptions.map((option, i) => {
      if (i === index) {
        const updatedOption = { ...option, ...updates };
        // Recalculate total cost
        updatedOption.total_cost = updatedOption.cost_per_person * updatedOption.total_passengers;
        return updatedOption;
      }
      return option;
    });
    onTransferOptionsChange(updated);
  };

  const removeTransferOption = (index: number) => {
    onTransferOptionsChange(transferOptions.filter((_, i) => i !== index));
  };

  const getTotalCost = () => {
    return transferOptions.reduce((total, option) => total + option.total_cost, 0);
  };

  const transferTypes = [
    'Airport Transfer',
    'Hotel Transfer',
    'Inter-city Transfer',
    'Park Transfer',
    'Station Transfer',
    'Port Transfer',
    'Custom Transfer'
  ];

  const vehicleTypes = [
    'Sedan',
    'SUV',
    'Mini Van',
    'Bus',
    'Land Cruiser',
    'Safari Vehicle',
    'Helicopter',
    'Boat',
    'Other'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transfers
          <Badge variant="secondary">
            Total: {formatCurrency(getTotalCost(), currencyCode)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transferOptions.map((option, index) => (
          <Card key={option.id || index} className="border-dashed">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Transfer Type</Label>
                  <Select
                    value={option.type}
                    onValueChange={(value) => updateTransferOption(index, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transfer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transferTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Route</Label>
                  <Input
                    value={option.route}
                    onChange={(e) => updateTransferOption(index, { route: e.target.value })}
                    placeholder="e.g., Airport - Hotel"
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
                    onChange={(e) => updateTransferOption(index, { total_passengers: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cost per Person</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={option.cost_per_person}
                    onChange={(e) => updateTransferOption(index, { cost_per_person: parseFloat(e.target.value) || 0 })}
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
                    onClick={() => removeTransferOption(index)}
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
          onClick={addTransferOption}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transfer
        </Button>
      </CardContent>
    </Card>
  );
};