
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Plus, Minus } from "lucide-react";

interface TransferSectionProps {
  transfers: any[];
  onTransfersChange: (transfers: any[]) => void;
}

const TransferSection: React.FC<TransferSectionProps> = ({ 
  transfers = [], 
  onTransfersChange 
}) => {
  const [transferItems, setTransferItems] = useState<any[]>(transfers);
  
  // Add a new transfer item
  const addTransfer = () => {
    const newId = `transfer-${Date.now()}`;
    const newTransfer = {
      id: newId,
      type: "Airport Transfer",
      description: "",
      vehicle: "Sedan",
      passengers: 2,
      costPerVehicle: 50,
      quantity: 1,
      total: 50
    };
    
    const updatedTransfers = [...transferItems, newTransfer];
    setTransferItems(updatedTransfers);
    onTransfersChange(updatedTransfers);
  };
  
  // Remove a transfer item
  const removeTransfer = (id: string) => {
    const updatedTransfers = transferItems.filter(item => item.id !== id);
    setTransferItems(updatedTransfers);
    onTransfersChange(updatedTransfers);
  };
  
  // Update a transfer item field
  const updateTransfer = (id: string, field: string, value: any) => {
    const updatedTransfers = transferItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total
        updatedItem.total = updatedItem.costPerVehicle * updatedItem.quantity;
        return updatedItem;
      }
      return item;
    });
    
    setTransferItems(updatedTransfers);
    onTransfersChange(updatedTransfers);
  };
  
  // Calculate transfer subtotal
  const calculateTransferSubtotal = () => {
    return transferItems.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Transfers</h3>
        <Button type="button" variant="outline" size="sm" onClick={addTransfer}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transfer
        </Button>
      </div>
      
      {transferItems.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-200 rounded-md">
          <p className="text-gray-500">No transfers added yet</p>
          <Button type="button" variant="ghost" size="sm" onClick={addTransfer} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Transfer
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {transferItems.map((item, index) => (
            <Card key={item.id} className="border border-gray-200">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Transfer {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTransfer(item.id)}
                    className="text-red-600"
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Transfer Type</label>
                    <Select 
                      value={item.type} 
                      onValueChange={(value) => updateTransfer(item.id, "type", value)}
                    >
                      <SelectTrigger className="bg-white text-black">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Airport Transfer">Airport Transfer</SelectItem>
                        <SelectItem value="Hotel to Hotel">Hotel to Hotel</SelectItem>
                        <SelectItem value="Hotel to Activity">Hotel to Activity</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateTransfer(item.id, "description", e.target.value)}
                      placeholder="E.g., Airport to hotel"
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
                    <Select 
                      value={item.vehicle} 
                      onValueChange={(value) => updateTransfer(item.id, "vehicle", value)}
                    >
                      <SelectTrigger className="bg-white text-black">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedan">Sedan (up to 3 pax)</SelectItem>
                        <SelectItem value="SUV">SUV (up to 5 pax)</SelectItem>
                        <SelectItem value="Minivan">Minivan (up to 7 pax)</SelectItem>
                        <SelectItem value="Van">Van (up to 12 pax)</SelectItem>
                        <SelectItem value="Bus">Bus (13+ pax)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Maximum Passengers</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.passengers}
                      onChange={(e) => updateTransfer(item.id, "passengers", parseInt(e.target.value) || 1)}
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cost Per Vehicle</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.costPerVehicle}
                      onChange={(e) => updateTransfer(item.id, "costPerVehicle", parseFloat(e.target.value) || 0)}
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateTransfer(item.id, "quantity", parseInt(e.target.value) || 1)}
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                
                <div className="mt-2 p-2 bg-gray-50 rounded-md flex justify-between items-center">
                  <span className="text-sm">
                    {item.quantity} x {item.vehicle} ({item.type})
                  </span>
                  <span className="font-medium">${item.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium">Transfers Subtotal</span>
            <span className="font-medium">${calculateTransferSubtotal().toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferSection;
