
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { QuoteTransfer } from "@/types/quote.types";
import { Card } from "../ui/card";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

// Vehicle types for dropdown
const vehicleTypes = [
  "Sedan",
  "SUV",
  "Van",
  "Minibus",
  "Coaster",
  "Bus"
];

interface TransferSectionProps {
  transfers: QuoteTransfer[];
  onTransfersChange: (transfers: QuoteTransfer[]) => void;
}

const TransferSection = ({ transfers, onTransfersChange }: TransferSectionProps) => {
  // Add new transfer
  const addTransfer = () => {
    const newTransfer: QuoteTransfer = {
      id: `transfer-${Date.now()}`,
      transferType: "Airport to Hotel",
      fromLocation: "",
      toLocation: "",
      vehicleType: "Van",
      numberOfVehicles: 1,
      costPerVehicle: 50,
      total: 50 // Initial total = 1 vehicle × $50
    };
    
    onTransfersChange([...transfers, newTransfer]);
    toast.success("Transfer added");
  };
  
  // Remove transfer
  const removeTransfer = (id: string) => {
    onTransfersChange(transfers.filter(transfer => transfer.id !== id));
    toast.success("Transfer removed");
  };
  
  // Update transfer field
  const updateTransfer = (id: string, field: keyof QuoteTransfer, value: any) => {
    const updatedTransfers = transfers.map(transfer => {
      if (transfer.id === id) {
        const updatedTransfer = {
          ...transfer,
          [field]: value
        };
        
        // Recalculate total when number of vehicles or cost per vehicle changes
        if (field === 'numberOfVehicles' || field === 'costPerVehicle') {
          updatedTransfer.total = updatedTransfer.numberOfVehicles * updatedTransfer.costPerVehicle;
        }
        
        return updatedTransfer;
      }
      return transfer;
    });
    
    onTransfersChange(updatedTransfers);
  };

  // Calculate subtotal for all transfers
  const calculateTransferSubtotal = () => {
    return transfers.reduce((sum, transfer) => sum + transfer.total, 0);
  };

  return (
    <div className="space-y-4">
      {transfers.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
          <p className="text-gray-500">No transfers added yet</p>
          <Button 
            onClick={addTransfer} 
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Transfer
          </Button>
        </div>
      ) : (
        <>
          {transfers.map((transfer, index) => (
            <Card key={transfer.id} className="p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Transfer #{index + 1}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeTransfer(transfer.id)}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Transfer Type</label>
                  <Select 
                    value={transfer.transferType} 
                    onValueChange={(value) => updateTransfer(transfer.id, "transferType", value)}
                  >
                    <SelectTrigger className="w-full bg-white text-gray-800 border border-teal-200 focus:ring-teal-500">
                      <SelectValue placeholder="Select transfer type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Airport to Hotel">Airport to Hotel</SelectItem>
                      <SelectItem value="Hotel to Hotel">Hotel to Hotel</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
                  <Select 
                    value={transfer.vehicleType} 
                    onValueChange={(value) => updateTransfer(transfer.id, "vehicleType", value)}
                  >
                    <SelectTrigger className="w-full bg-white text-gray-800 border border-teal-200 focus:ring-teal-500">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {vehicleTypes.map(vehicle => (
                        <SelectItem key={vehicle} value={vehicle}>{vehicle}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Location</label>
                  <Input
                    type="text"
                    value={transfer.fromLocation}
                    onChange={(e) => updateTransfer(transfer.id, "fromLocation", e.target.value)}
                    placeholder="e.g., Airport name, Hotel name"
                    className="bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To Location</label>
                  <Input
                    type="text"
                    value={transfer.toLocation}
                    onChange={(e) => updateTransfer(transfer.id, "toLocation", e.target.value)}
                    placeholder="e.g., Hotel name, Activity site"
                    className="bg-white text-gray-800"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Number of Vehicles</label>
                  <Input
                    type="number"
                    min="1"
                    value={transfer.numberOfVehicles}
                    onChange={(e) => updateTransfer(transfer.id, "numberOfVehicles", parseInt(e.target.value) || 1)}
                    className="bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cost per Vehicle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={transfer.costPerVehicle}
                      onChange={(e) => updateTransfer(transfer.id, "costPerVehicle", parseFloat(e.target.value) || 0)}
                      className="pl-6 bg-white text-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Total Cost</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 flex items-center">
                    <span className="text-gray-500">$</span>
                    <span className="ml-1">{transfer.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-gray-50 rounded-md">
                <p className="text-sm">
                  {transfer.transferType}: {transfer.fromLocation || "[From]"} → {transfer.toLocation || "[To]"} | 
                  {transfer.numberOfVehicles} {transfer.vehicleType}(s) × ${transfer.costPerVehicle.toFixed(2)}
                </p>
              </div>
            </Card>
          ))}
          
          <div className="flex justify-between items-center">
            <Button onClick={addTransfer}>
              <Plus className="mr-2 h-4 w-4" />
              Add Another Transfer
            </Button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="font-medium">${calculateTransferSubtotal().toFixed(2)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TransferSection;
