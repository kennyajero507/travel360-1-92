
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DatePicker } from "../ui/date-picker";
import { QuoteTransfer } from "../../types/quote.types";
import { MapPin, Car, Trash, Plus, Edit, Check } from "lucide-react";
import { Badge } from "../ui/badge";

interface TransferSectionProps {
  transfers: QuoteTransfer[];
  onTransfersChange: (transfers: QuoteTransfer[]) => void;
}

const TransferSection: React.FC<TransferSectionProps> = ({ transfers, onTransfersChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [transfer, setTransfer] = useState<QuoteTransfer>({
    id: `transfer-${Date.now()}`,
    type: "airport_pickup",
    from: "",
    to: "",
    date: new Date().toISOString(),
    vehicle_type: "sedan",
    cost_per_vehicle: 0,
    num_vehicles: 1,
    total: 0
  });

  const handleInputChange = (field: string, value: any) => {
    setTransfer(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total cost
      if (field === "cost_per_vehicle" || field === "num_vehicles") {
        updated.total = updated.cost_per_vehicle * updated.num_vehicles;
      }
      
      return updated;
    });
  };

  const handleAdd = () => {
    const newTransfer = {
      ...transfer,
      id: `transfer-${Date.now()}`,
      total: transfer.cost_per_vehicle * transfer.num_vehicles
    };
    
    onTransfersChange([...transfers, newTransfer]);
    resetForm();
    setIsAdding(false);
  };

  const handleEdit = (index: number) => {
    setTransfer(transfers[index]);
    setEditingIndex(index);
  };

  const handleUpdate = () => {
    if (editingIndex === null) return;
    
    const updatedTransfer = {
      ...transfer,
      total: transfer.cost_per_vehicle * transfer.num_vehicles
    };
    
    const updatedTransfers = [...transfers];
    updatedTransfers[editingIndex] = updatedTransfer;
    onTransfersChange(updatedTransfers);
    
    resetForm();
  };

  const handleDelete = (index: number) => {
    const updatedTransfers = [...transfers];
    updatedTransfers.splice(index, 1);
    onTransfersChange(updatedTransfers);
  };

  const resetForm = () => {
    setTransfer({
      id: `transfer-${Date.now()}`,
      type: "airport_pickup",
      from: "",
      to: "",
      date: new Date().toISOString(),
      vehicle_type: "sedan",
      cost_per_vehicle: 0,
      num_vehicles: 1,
      total: 0
    });
    setEditingIndex(null);
  };

  const cancelForm = () => {
    resetForm();
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Transfers
          </CardTitle>
          {!isAdding && editingIndex === null && (
            <Button 
              size="sm"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Transfer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Transfer form */}
        {(isAdding || editingIndex !== null) && (
          <div className="space-y-4 p-4 border rounded-md bg-gray-50 mb-4">
            <h3 className="font-medium">{editingIndex !== null ? "Edit Transfer" : "Add New Transfer"}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-type">Transfer Type</Label>
                <Select
                  value={transfer.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger id="transfer-type">
                    <SelectValue placeholder="Select transfer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airport_pickup">Airport Pickup</SelectItem>
                    <SelectItem value="airport_drop">Airport Drop-off</SelectItem>
                    <SelectItem value="hotel_transfer">Hotel Transfer</SelectItem>
                    <SelectItem value="sightseeing">Sightseeing Transfer</SelectItem>
                    <SelectItem value="intercity">Intercity Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-date">Date</Label>
                <DatePicker
                  date={transfer.date ? new Date(transfer.date) : undefined}
                  onSelect={(date) => 
                    handleInputChange("date", date ? date.toISOString() : new Date().toISOString())
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-from">From</Label>
                <Input
                  id="transfer-from"
                  value={transfer.from}
                  onChange={(e) => handleInputChange("from", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-to">To</Label>
                <Input
                  id="transfer-to"
                  value={transfer.to}
                  onChange={(e) => handleInputChange("to", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicle-type">Vehicle Type</Label>
                <Select
                  value={transfer.vehicle_type}
                  onValueChange={(value) => handleInputChange("vehicle_type", value)}
                >
                  <SelectTrigger id="vehicle-type">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="mini_bus">Mini Bus</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-cost">Cost Per Vehicle</Label>
                <Input
                  id="transfer-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={transfer.cost_per_vehicle}
                  onChange={(e) => handleInputChange("cost_per_vehicle", parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-vehicles">Number of Vehicles</Label>
                <Input
                  id="transfer-vehicles"
                  type="number"
                  min="1"
                  value={transfer.num_vehicles}
                  onChange={(e) => handleInputChange("num_vehicles", parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-description">Description/Notes (Optional)</Label>
                <Input
                  id="transfer-description"
                  value={transfer.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Total Cost</Label>
                <div className="p-2 bg-gray-100 border rounded-md font-medium">
                  ${(transfer.cost_per_vehicle * transfer.num_vehicles).toFixed(2)}
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
                disabled={!transfer.from || !transfer.to || transfer.cost_per_vehicle <= 0}
              >
                <Check className="h-4 w-4 mr-1" />
                {editingIndex !== null ? "Update" : "Add"} Transfer
              </Button>
            </div>
          </div>
        )}
        
        {/* Transfer list */}
        {transfers.length > 0 ? (
          <div className="space-y-3">
            {transfers.map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="capitalize" variant="outline">
                      {item.type.replace('_', ' ')}
                    </Badge>
                    <h4 className="font-medium">
                      {item.from} → {item.to}
                    </h4>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span> | {item.vehicle_type.replace('_', ' ')} </span>
                    {item.description && <span> | {item.description}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${item.total.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    ${item.cost_per_vehicle.toFixed(2)} × {item.num_vehicles} vehicle(s)
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
            No transfers added yet. Click "Add Transfer" to get started.
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {transfers.length} transfer{transfers.length !== 1 ? 's' : ''} added
          </div>
          <div className="font-medium">
            Total: ${transfers.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TransferSection;
