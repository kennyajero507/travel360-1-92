
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Plane, Plus, X, Train, Bus } from "lucide-react";
import { QuoteTransport } from "../../types/quote.types";

interface TransportBookingSectionProps {
  transports: QuoteTransport[];
  onTransportsChange: (transports: QuoteTransport[]) => void;
}

const TransportBookingSection: React.FC<TransportBookingSectionProps> = ({
  transports,
  onTransportsChange
}) => {
  const addTransport = () => {
    const newTransport: QuoteTransport = {
      id: `transport-${Date.now()}`,
      type: 'flight',
      from: '',
      to: '',
      date: new Date().toISOString().split('T')[0],
      cost_per_person: 0,
      num_passengers: 1,
      total_cost: 0,
      provider: '',
      description: ''
    };
    
    onTransportsChange([...transports, newTransport]);
  };

  const updateTransport = (id: string, updates: Partial<QuoteTransport>) => {
    const updatedTransports = transports.map(transport => {
      if (transport.id === id) {
        const updated = { ...transport, ...updates };
        updated.total_cost = updated.cost_per_person * updated.num_passengers;
        return updated;
      }
      return transport;
    });
    onTransportsChange(updatedTransports);
  };

  const removeTransport = (id: string) => {
    onTransportsChange(transports.filter(transport => transport.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const transportTypes = [
    { value: 'flight', label: 'Flight', icon: Plane },
    { value: 'train', label: 'Train', icon: Train },
    { value: 'bus', label: 'Bus', icon: Bus },
    { value: 'private_car', label: 'Private Car', icon: Bus },
    { value: 'taxi', label: 'Taxi', icon: Bus }
  ];

  const getTransportIcon = (type: string) => {
    const transportType = transportTypes.find(t => t.value === type);
    return transportType ? transportType.icon : Plane;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-blue-600" />
          Transport Bookings
        </CardTitle>
        <Button onClick={addTransport} size="sm" className="w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Add Transport
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Plane className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No transport bookings added yet</p>
            <Button onClick={addTransport} size="sm" className="mt-2">
              Add First Transport
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {transports.map(transport => {
              const TransportIcon = getTransportIcon(transport.type);
              
              return (
                <Card key={transport.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-3">
                        <div>
                          <Label>Transport Type</Label>
                          <Select
                            value={transport.type}
                            onValueChange={(value) => updateTransport(transport.id, { type: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {transportTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className="h-4 w-4" />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Provider</Label>
                          <Input
                            value={transport.provider || ''}
                            onChange={(e) => updateTransport(transport.id, { provider: e.target.value })}
                            placeholder="Airline, Bus company, etc."
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label>From</Label>
                          <Input
                            value={transport.from}
                            onChange={(e) => updateTransport(transport.id, { from: e.target.value })}
                            placeholder="Departure location"
                          />
                        </div>
                        <div>
                          <Label>To</Label>
                          <Input
                            value={transport.to}
                            onChange={(e) => updateTransport(transport.id, { to: e.target.value })}
                            placeholder="Arrival location"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={transport.date}
                            onChange={(e) => updateTransport(transport.id, { date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={transport.time || ''}
                            onChange={(e) => updateTransport(transport.id, { time: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Cost per Person</Label>
                            <Input
                              type="number"
                              value={transport.cost_per_person}
                              onChange={(e) => updateTransport(transport.id, { cost_per_person: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <Label>Passengers</Label>
                            <Input
                              type="number"
                              min="1"
                              value={transport.num_passengers}
                              onChange={(e) => updateTransport(transport.id, { num_passengers: parseInt(e.target.value) || 1 })}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">Total:</span>
                            <Badge variant="outline" className="ml-2 text-blue-600 font-medium">
                              {formatCurrency(transport.total_cost)}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => removeTransport(transport.id)}
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

                    {transport.description && (
                      <div className="mt-3 pt-3 border-t">
                        <Label>Notes</Label>
                        <Input
                          value={transport.description}
                          onChange={(e) => updateTransport(transport.id, { description: e.target.value })}
                          placeholder="Additional details..."
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {transports.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Transport:</span>
              <Badge className="bg-blue-600 text-white">
                {formatCurrency(transports.reduce((sum, transport) => sum + transport.total_cost, 0))}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransportBookingSection;
