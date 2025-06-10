
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { MapPin, Plus, X, Car } from "lucide-react";
import { QuoteTransfer } from "../../types/quote.types";

interface TransferSectionProps {
  transfers: QuoteTransfer[];
  onTransfersChange: (transfers: QuoteTransfer[]) => void;
}

const TransferSection: React.FC<TransferSectionProps> = ({
  transfers,
  onTransfersChange
}) => {
  const addTransfer = () => {
    const newTransfer: QuoteTransfer = {
      id: `transfer-${Date.now()}`,
      type: 'airport_pickup',
      from: '',
      to: '',
      date: new Date().toISOString().split('T')[0],
      vehicle_type: 'sedan',
      cost_per_vehicle: 50,
      num_vehicles: 1,
      total: 50,
      description: '',
      hotel_id: undefined
    };
    
    onTransfersChange([...transfers, newTransfer]);
  };

  const updateTransfer = (id: string, updates: Partial<QuoteTransfer>) => {
    const updatedTransfers = transfers.map(transfer => {
      if (transfer.id === id) {
        const updated = { ...transfer, ...updates };
        updated.total = updated.cost_per_vehicle * updated.num_vehicles;
        return updated;
      }
      return transfer;
    });
    onTransfersChange(updatedTransfers);
  };

  const removeTransfer = (id: string) => {
    onTransfersChange(transfers.filter(transfer => transfer.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const transferTypes = [
    { value: 'airport_pickup', label: 'Airport Pickup' },
    { value: 'airport_drop', label: 'Airport Drop-off' },
    { value: 'hotel_transfer', label: 'Hotel Transfer' },
    { value: 'sightseeing', label: 'Sightseeing Transfer' },
    { value: 'intercity', label: 'Intercity Transfer' }
  ];

  const vehicleTypes = [
    { value: 'sedan', label: 'Sedan (1-3 pax)' },
    { value: 'suv', label: 'SUV (1-6 pax)' },
    { value: 'van', label: 'Van (7-12 pax)' },
    { value: 'bus', label: 'Bus (13+ pax)' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Transfers & Transportation
        </CardTitle>
        <Button onClick={addTransfer} size="sm" className="w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Add Transfer
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transfers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No transfers added yet</p>
            <Button onClick={addTransfer} size="sm" className="mt-2">
              Add First Transfer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map(transfer => (
              <Card key={transfer.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Transfer Type</Label>
                        <Select
                          value={transfer.type}
                          onValueChange={(value) => updateTransfer(transfer.id, { type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {transferTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={transfer.date}
                          onChange={(e) => updateTransfer(transfer.id, { date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label>From</Label>
                        <Input
                          value={transfer.from}
                          onChange={(e) => updateTransfer(transfer.id, { from: e.target.value })}
                          placeholder="Pickup location"
                        />
                      </div>
                      <div>
                        <Label>To</Label>
                        <Input
                          value={transfer.to}
                          onChange={(e) => updateTransfer(transfer.id, { to: e.target.value })}
                          placeholder="Drop-off location"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label>Vehicle Type</Label>
                        <Select
                          value={transfer.vehicle_type}
                          onValueChange={(value) => updateTransfer(transfer.id, { vehicle_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleTypes.map(vehicle => (
                              <SelectItem key={vehicle.value} value={vehicle.value}>
                                {vehicle.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Cost per Vehicle</Label>
                          <Input
                            type="number"
                            value={transfer.cost_per_vehicle}
                            onChange={(e) => updateTransfer(transfer.id, { cost_per_vehicle: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Vehicles</Label>
                          <Input
                            type="number"
                            min="1"
                            value={transfer.num_vehicles}
                            onChange={(e) => updateTransfer(transfer.id, { num_vehicles: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-right">
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">Total:</span>
                          <Badge variant="outline" className="ml-2 text-green-600 font-medium">
                            {formatCurrency(transfer.total)}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeTransfer(transfer.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  {transfer.description && (
                    <div className="mt-3 pt-3 border-t">
                      <Label>Description</Label>
                      <Input
                        value={transfer.description}
                        onChange={(e) => updateTransfer(transfer.id, { description: e.target.value })}
                        placeholder="Additional details..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {transfers.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Transfers:</span>
              <Badge className="bg-green-600 text-white">
                {formatCurrency(transfers.reduce((sum, transfer) => sum + transfer.total, 0))}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransferSection;
