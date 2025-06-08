import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plane, Train, Bus, Car, Plus, Trash2, Calendar, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "../../lib/utils";

interface Transport {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'private_car';
  from: string;
  to: string;
  date: string;
  time?: string;
  passengers: number;
  cost_per_person: number;
  total_cost: number;
  description?: string;
  booking_reference?: string;
  provider?: string;
}

interface TransportBookingSectionProps {
  transports: Transport[];
  onTransportsChange: (transports: Transport[]) => void;
}

const TransportBookingSection: React.FC<TransportBookingSectionProps> = ({
  transports,
  onTransportsChange
}) => {
  const [newTransport, setNewTransport] = useState<Partial<Transport>>({
    type: 'flight',
    from: '',
    to: '',
    date: '',
    time: '',
    passengers: 1,
    cost_per_person: 0,
    description: '',
    provider: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const transportIcons = {
    flight: Plane,
    train: Train,
    bus: Bus,
    private_car: Car
  };

  const transportTypes = [
    { value: 'flight', label: 'Flight', icon: Plane },
    { value: 'train', label: 'Train', icon: Train },
    { value: 'bus', label: 'Bus', icon: Bus },
    { value: 'private_car', label: 'Private Car', icon: Car }
  ];

  const addTransport = () => {
    if (!newTransport.from || !newTransport.to || !newTransport.date) {
      return;
    }

    const transport: Transport = {
      id: `transport-${Date.now()}`,
      type: newTransport.type as Transport['type'],
      from: newTransport.from!,
      to: newTransport.to!,
      date: newTransport.date!,
      time: newTransport.time,
      passengers: newTransport.passengers || 1,
      cost_per_person: newTransport.cost_per_person || 0,
      total_cost: (newTransport.passengers || 1) * (newTransport.cost_per_person || 0),
      description: newTransport.description,
      booking_reference: '',
      provider: newTransport.provider
    };

    onTransportsChange([...transports, transport]);
    
    // Reset form
    setNewTransport({
      type: 'flight',
      from: '',
      to: '',
      date: '',
      time: '',
      passengers: 1,
      cost_per_person: 0,
      description: '',
      provider: ''
    });
    setSelectedDate(null);
  };

  const removeTransport = (id: string) => {
    onTransportsChange(transports.filter(t => t.id !== id));
  };

  const updateTransport = (id: string, updates: Partial<Transport>) => {
    onTransportsChange(transports.map(t => 
      t.id === id 
        ? { 
            ...t, 
            ...updates, 
            total_cost: updates.passengers && updates.cost_per_person 
              ? updates.passengers * updates.cost_per_person 
              : t.total_cost 
          } 
        : t
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalTransportCost = transports.reduce((sum, transport) => sum + transport.total_cost, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Plane className="h-5 w-5 text-blue-600" />
        <CardTitle>Transport Booking</CardTitle>
        <Badge variant="outline" className="ml-auto">
          Total: {formatCurrency(totalTransportCost)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Transport Form */}
        <Card className="border border-blue-100 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add New Transport</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Transport Type</Label>
                <Select 
                  value={newTransport.type} 
                  onValueChange={(value) => setNewTransport({...newTransport, type: value as Transport['type']})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport type" />
                  </SelectTrigger>
                  <SelectContent>
                    {transportTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Provider/Airline</Label>
                <Input
                  value={newTransport.provider || ''}
                  onChange={(e) => setNewTransport({...newTransport, provider: e.target.value})}
                  placeholder="e.g., Emirates, Indian Railways"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>From</Label>
                <Input
                  value={newTransport.from || ''}
                  onChange={(e) => setNewTransport({...newTransport, from: e.target.value})}
                  placeholder="Departure city/airport"
                />
              </div>

              <div>
                <Label>To</Label>
                <Input
                  value={newTransport.to || ''}
                  onChange={(e) => setNewTransport({...newTransport, to: e.target.value})}
                  placeholder="Arrival city/airport"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={(date) => {
                        setSelectedDate(date || null);
                        setNewTransport({
                          ...newTransport, 
                          date: date ? format(date, 'yyyy-MM-dd') : ''
                        });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Time (Optional)</Label>
                <Input
                  type="time"
                  value={newTransport.time || ''}
                  onChange={(e) => setNewTransport({...newTransport, time: e.target.value})}
                />
              </div>

              <div>
                <Label>Passengers</Label>
                <Input
                  type="number"
                  min="1"
                  value={newTransport.passengers || 1}
                  onChange={(e) => {
                    const passengers = parseInt(e.target.value) || 1;
                    setNewTransport({
                      ...newTransport, 
                      passengers,
                      total_cost: passengers * (newTransport.cost_per_person || 0)
                    });
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Cost per Person</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTransport.cost_per_person || ''}
                  onChange={(e) => {
                    const cost = parseFloat(e.target.value) || 0;
                    setNewTransport({
                      ...newTransport, 
                      cost_per_person: cost,
                      total_cost: (newTransport.passengers || 1) * cost
                    });
                  }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Total Cost</Label>
                <Input
                  value={formatCurrency((newTransport.passengers || 1) * (newTransport.cost_per_person || 0))}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={newTransport.description || ''}
                onChange={(e) => setNewTransport({...newTransport, description: e.target.value})}
                placeholder="Additional details about the transport"
                rows={2}
              />
            </div>

            <Button 
              onClick={addTransport}
              className="w-full"
              disabled={!newTransport.from || !newTransport.to || !newTransport.date}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transport
            </Button>
          </CardContent>
        </Card>

        {/* Existing Transports */}
        {transports.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Transport Bookings ({transports.length})</h3>
            {transports.map((transport) => {
              const Icon = transportIcons[transport.type];
              return (
                <Card key={transport.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <Badge variant="outline">
                          {transport.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {transport.provider && (
                          <span className="text-sm text-gray-600">• {transport.provider}</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTransport(transport.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-gray-500">Route</Label>
                        <p className="font-medium">{transport.from} → {transport.to}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Date & Time</Label>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <p className="text-sm">{format(new Date(transport.date), 'MMM dd, yyyy')}</p>
                          {transport.time && (
                            <>
                              <Clock className="h-3 w-3 text-gray-400 ml-2" />
                              <p className="text-sm">{transport.time}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Passengers</Label>
                        <p className="font-medium">{transport.passengers}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Total Cost</Label>
                        <p className="font-bold text-green-600">{formatCurrency(transport.total_cost)}</p>
                      </div>
                    </div>

                    {transport.description && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {transport.description}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {transports.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transport bookings added yet</p>
            <p className="text-sm text-gray-400">Add flights, trains, buses, or private car transfers</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransportBookingSection;
