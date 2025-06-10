
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DatePicker } from "../ui/date-picker";
import { QuoteTransport } from "../../types/quote.types";
import { Bus, PlaneTakeoff, Train, Car, Trash, Plus, Edit, Check } from "lucide-react";
import { Badge } from "../ui/badge";

interface TransportBookingSectionProps {
  transports: QuoteTransport[];
  onTransportsChange: (transports: QuoteTransport[]) => void;
}

const TransportBookingSection: React.FC<TransportBookingSectionProps> = ({ transports, onTransportsChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [transport, setTransport] = useState<QuoteTransport>({
    id: `transport-${Date.now()}`,
    type: "flight",
    from: "",
    to: "",
    date: new Date().toISOString(),
    cost_per_person: 0,
    num_passengers: 1,
    total_cost: 0
  });

  const handleInputChange = (field: string, value: any) => {
    setTransport(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total cost
      if (field === "cost_per_person" || field === "num_passengers") {
        updated.total_cost = updated.cost_per_person * updated.num_passengers;
      }
      
      return updated;
    });
  };

  const handleAdd = () => {
    const newTransport = {
      ...transport,
      id: `transport-${Date.now()}`,
      total_cost: transport.cost_per_person * transport.num_passengers
    };
    
    onTransportsChange([...transports, newTransport]);
    resetForm();
    setIsAdding(false);
  };

  const handleEdit = (index: number) => {
    setTransport(transports[index]);
    setEditingIndex(index);
  };

  const handleUpdate = () => {
    if (editingIndex === null) return;
    
    const updatedTransport = {
      ...transport,
      total_cost: transport.cost_per_person * transport.num_passengers
    };
    
    const updatedTransports = [...transports];
    updatedTransports[editingIndex] = updatedTransport;
    onTransportsChange(updatedTransports);
    
    resetForm();
  };

  const handleDelete = (index: number) => {
    const updatedTransports = [...transports];
    updatedTransports.splice(index, 1);
    onTransportsChange(updatedTransports);
  };

  const resetForm = () => {
    setTransport({
      id: `transport-${Date.now()}`,
      type: "flight",
      from: "",
      to: "",
      date: new Date().toISOString(),
      cost_per_person: 0,
      num_passengers: 1,
      total_cost: 0
    });
    setEditingIndex(null);
  };

  const cancelForm = () => {
    resetForm();
    setIsAdding(false);
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <PlaneTakeoff className="h-4 w-4" />;
      case "train":
        return <Train className="h-4 w-4" />;
      case "bus":
        return <Bus className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-blue-600" />
            Transport Bookings
          </CardTitle>
          {!isAdding && editingIndex === null && (
            <Button 
              size="sm"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Transport
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Transport form */}
        {(isAdding || editingIndex !== null) && (
          <div className="space-y-4 p-4 border rounded-md bg-gray-50 mb-4">
            <h3 className="font-medium">{editingIndex !== null ? "Edit Transport" : "Add New Transport"}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transport-type">Transport Type</Label>
                <Select
                  value={transport.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger id="transport-type">
                    <SelectValue placeholder="Select transport type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="private_car">Private Car</SelectItem>
                    <SelectItem value="taxi">Taxi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transport-date">Date</Label>
                <DatePicker
                  date={transport.date ? new Date(transport.date) : undefined}
                  onSelect={(date) => 
                    handleInputChange("date", date ? date.toISOString() : new Date().toISOString())
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transport-from">From</Label>
                <Input
                  id="transport-from"
                  value={transport.from}
                  onChange={(e) => handleInputChange("from", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transport-to">To</Label>
                <Input
                  id="transport-to"
                  value={transport.to}
                  onChange={(e) => handleInputChange("to", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transport-cost">Cost Per Person</Label>
                <Input
                  id="transport-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={transport.cost_per_person}
                  onChange={(e) => handleInputChange("cost_per_person", parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transport-passengers">Number of Passengers</Label>
                <Input
                  id="transport-passengers"
                  type="number"
                  min="1"
                  value={transport.num_passengers}
                  onChange={(e) => handleInputChange("num_passengers", parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transport-description">Description/Notes (Optional)</Label>
                <Input
                  id="transport-description"
                  value={transport.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Total Cost</Label>
                <div className="p-2 bg-gray-100 border rounded-md font-medium">
                  ${(transport.cost_per_person * transport.num_passengers).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={cancelForm}
              >
                Cancel
              </Button>
              <Button
                onClick={editingIndex !== null ? handleUpdate : handleAdd}
                disabled={!transport.from || !transport.to || transport.cost_per_person <= 0}
              >
                <Check className="h-4 w-4 mr-1" />
                {editingIndex !== null ? "Update" : "Add"} Transport
              </Button>
            </div>
          </div>
        )}
        
        {/* Transport list */}
        {transports.length > 0 ? (
          <div className="space-y-3">
            {transports.map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="capitalize" variant="outline">
                      <span className="flex items-center gap-1">
                        {getTransportIcon(item.type)}
                        {item.type.replace('_', ' ')}
                      </span>
                    </Badge>
                    <h4 className="font-medium">
                      {item.from} → {item.to}
                    </h4>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    {item.description && <span> | {item.description}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${item.total_cost.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    ${item.cost_per_person.toFixed(2)} × {item.num_passengers} passengers
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(index)}
                    disabled={isAdding || editingIndex !== null}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="text-red-500"
                    disabled={isAdding || editingIndex !== null}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transport bookings added yet. Click "Add Transport" to get started.
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {transports.length} transport booking{transports.length !== 1 ? 's' : ''} added
          </div>
          <div className="font-medium">
            Total: ${transports.reduce((sum, item) => sum + item.total_cost, 0).toFixed(2)}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TransportBookingSection;
