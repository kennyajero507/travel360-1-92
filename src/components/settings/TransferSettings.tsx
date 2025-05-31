
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TransferType {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costType: 'per_km' | 'per_person' | 'fixed';
  vendor: string;
}

export const TransferSettings = () => {
  const [transfers, setTransfers] = useState<TransferType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<TransferType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseCost: 0,
    costType: 'fixed' as 'per_km' | 'per_person' | 'fixed',
    vendor: '',
  });

  // Mock data
  useEffect(() => {
    setTransfers([
      {
        id: '1',
        name: 'Airport Transfer',
        description: 'Transfer from/to airport',
        baseCost: 50,
        costType: 'fixed',
        vendor: 'Safari Transfers Ltd'
      },
      {
        id: '2',
        name: 'Private Car',
        description: 'Private car with driver',
        baseCost: 1.5,
        costType: 'per_km',
        vendor: 'Elite Car Rental'
      },
      {
        id: '3',
        name: 'Shuttle Service',
        description: 'Shared shuttle service',
        baseCost: 15,
        costType: 'per_person',
        vendor: 'City Shuttle'
      }
    ]);
  }, []);

  const handleSave = () => {
    if (editingTransfer) {
      setTransfers(prev => prev.map(transfer => 
        transfer.id === editingTransfer.id 
          ? { ...transfer, ...formData }
          : transfer
      ));
      toast.success("Transfer type updated successfully");
    } else {
      const newTransfer: TransferType = {
        id: Date.now().toString(),
        ...formData,
      };
      setTransfers(prev => [...prev, newTransfer]);
      toast.success("Transfer type added successfully");
    }
    
    setIsDialogOpen(false);
    setEditingTransfer(null);
    setFormData({ name: '', description: '', baseCost: 0, costType: 'fixed', vendor: '' });
  };

  const handleEdit = (transfer: TransferType) => {
    setEditingTransfer(transfer);
    setFormData({
      name: transfer.name,
      description: transfer.description,
      baseCost: transfer.baseCost,
      costType: transfer.costType,
      vendor: transfer.vendor,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTransfers(prev => prev.filter(transfer => transfer.id !== id));
    toast.success("Transfer type deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Transfer & Transport Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage transfer types and transport options
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transfer Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTransfer ? 'Edit Transfer Type' : 'Add New Transfer Type'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Transfer Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Airport Transfer"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the transfer service"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseCost">Base Cost</Label>
                  <Input
                    id="baseCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.baseCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseCost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="costType">Cost Type</Label>
                  <select
                    id="costType"
                    value={formData.costType}
                    onChange={(e) => setFormData(prev => ({ ...prev, costType: e.target.value as 'per_km' | 'per_person' | 'fixed' }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="fixed">Fixed Rate</option>
                    <option value="per_km">Per Kilometer</option>
                    <option value="per_person">Per Person</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="vendor">Vendor/Provider</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  placeholder="e.g., Safari Transfers Ltd"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingTransfer ? 'Update' : 'Add'} Transfer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Base Cost</TableHead>
                <TableHead>Cost Type</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium">{transfer.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{transfer.description}</TableCell>
                  <TableCell>${transfer.baseCost}</TableCell>
                  <TableCell className="capitalize">{transfer.costType.replace('_', ' ')}</TableCell>
                  <TableCell>{transfer.vendor}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(transfer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transfer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
