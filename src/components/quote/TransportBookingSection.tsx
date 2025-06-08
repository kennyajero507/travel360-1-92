
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Plus, X, Bus, Plane, Train } from "lucide-react";
import MarkupCalculator from "./MarkupCalculator";

interface TransportItem {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'private_car';
  from: string;
  to: string;
  date: string;
  passengers: number;
  cost_per_person: number;
  total_cost: number;
  details?: string;
}

interface TransportBookingSectionProps {
  transports: TransportItem[];
  onTransportsChange: (transports: TransportItem[]) => void;
}

const TransportBookingSection: React.FC<TransportBookingSectionProps> = ({
  transports,
  onTransportsChange
}) => {
  const [newTransport, setNewTransport] = useState<Partial<TransportItem>>({
    type: 'flight',
    from: '',
    to: '',
    date: '',
    passengers: 1,
    cost_per_person: 0,
    details: ''
  });

  const addTransport = () => {
    if (!newTransport.from || !newTransport.to || !newTransport.date) {
      return;
    }

    const transport: TransportItem = {
      id: `transport-${Date.now()}`,
      type: newTransport.type as 'flight' | 'train' | 'bus' | 'private_car',
      from: newTransport.from,
      to: newTransport.to,
      date: newTransport.date,
      passengers: newTransport.passengers || 1,
      cost_per_person: newTransport.cost_per_person || 0,
      total_cost: (newTransport.passengers || 1) * (newTransport.cost_per_person || 0),
      details: newTransport.details
    };

    onTransportsChange([...transports, transport]);
    
    // Reset form
    setNewTransport({
      type: 'flight',
      from: '',
      to: '',
      date: '',
      passengers: 1,
      cost_per_person: 0,
      details: ''
    });
  };

  const updateTransport = (id: string, updates: Partial<TransportItem>) => {
    const updated = transports.map(transport => {
      if (transport.id === id) {
        const updatedTransport = { ...transport, ...updates };
        // Recalculate total cost
        updatedTransport.total_cost = updatedTransport.passengers * updatedTransport.cost_per_person;
        return updatedTransport;
      }
      return transport;
    });
    onTransportsChange(updated);
  };

  const removeTransport = (id: string) => {
    onTransportsChange(transports.filter(t => t.id !== id));
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'train': return <Train className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'private_car': return <Bus className="h-4 w-4" />;
      default: return <Bus className="h-4 w-4" />;
    }
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
        <Bus className="h-5 w-5 text-purple-600" />
        <CardTitle>Transport Booking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Transport Form */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">Add Transport</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select
              value={newTransport.type}
              onValueChange={(value: 'flight' | 'train' | 'bus' | 'private_car') => 
                setNewTransport({...newTransport, type: value})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flight">Flight</SelectItem>
                <SelectItem value="train">Train</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="private_car">Private Car</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="From"
              value={newTransport.from}
              onChange={(e) => setNewTransport({...newTransport, from: e.target.value})}
            />
            
            <Input
              placeholder="To"
              value={newTransport.to}
              onChange={(e) => setNewTransport({...newTransport, to: e.target.value})}
            />
            
            <Input
              type="date"
              value={newTransport.date}
              onChange={(e) => setNewTransport({...newTransport, date: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Input
              type="number"
              placeholder="Passengers"
              min="1"
              value={newTransport.passengers}
              onChange={(e) => setNewTransport({...newTransport, passengers: parseInt(e.target.value) || 1})}
            />
            
            <Input
              type="number"
              placeholder="Cost per person"
              min="0"
              step="0.01"
              value={newTransport.cost_per_person}
              onChange={(e) => setNewTransport({...newTransport, cost_per_person: parseFloat(e.target.value) || 0})}
            />
            
            <Input
              placeholder="Details (optional)"
              value={newTransport.details}
              onChange={(e) => setNewTransport({...newTransport, details: e.target.value})}
            />
            
            <Button onClick={addTransport} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Transport List */}
        {transports.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Passengers</TableHead>
                  <TableHead className="text-right">Cost/Person</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transports.map((transport) => (
                  <TableRow key={transport.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransportIcon(transport.type)}
                        <span className="capitalize">{transport.type.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Input
                          value={transport.from}
                          onChange={(e) => updateTransport(transport.id, { from: e.target.value })}
                          className="mb-1"
                          placeholder="From"
                        />
                        <Input
                          value={transport.to}
                          onChange={(e) => updateTransport(transport.id, { to: e.target.value })}
                          placeholder="To"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={transport.date}
                        onChange={(e) => updateTransport(transport.id, { date: e.target.value })}
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={transport.passengers}
                        onChange={(e) => updateTransport(transport.id, { passengers: parseInt(e.target.value) || 1 })}
                        className="w-20 text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={transport.cost_per_person}
                        onChange={(e) => updateTransport(transport.id, { cost_per_person: parseFloat(e.target.value) || 0 })}
                        className="w-28 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transport.total_cost)}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={transport.details || ''}
                        onChange={(e) => updateTransport(transport.id, { details: e.target.value })}
                        placeholder="Details"
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTransport(transport.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {transports.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transport bookings added yet</p>
            <p className="text-sm text-gray-400">Add flights, trains, buses, or private car transfers</p>
          </div>
        )}

        {/* Transport Total with Markup */}
        {totalTransportCost > 0 && (
          <div className="border-t pt-4">
            <MarkupCalculator
              basePrice={totalTransportCost}
              initialMarkup={15}
              onMarkupChange={(calculation) => {
                // Handle markup calculation
                console.log('Transport markup:', calculation);
              }}
              label="Transport"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransportBookingSection;
