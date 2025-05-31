
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  type: 'domestic' | 'international';
  is_active: boolean;
}

export const DestinationManagement = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    region: '',
    type: 'domestic' as 'domestic' | 'international',
    is_active: true,
  });

  // Mock data for now
  useEffect(() => {
    setDestinations([
      { id: '1', name: 'Nairobi', country: 'Kenya', region: 'Central Kenya', type: 'domestic', is_active: true },
      { id: '2', name: 'Mombasa', country: 'Kenya', region: 'Coastal Kenya', type: 'domestic', is_active: true },
      { id: '3', name: 'Dubai', country: 'UAE', region: 'Middle East', type: 'international', is_active: true },
      { id: '4', name: 'Zanzibar', country: 'Tanzania', region: 'East Africa', type: 'international', is_active: false },
    ]);
  }, []);

  const handleSave = () => {
    if (editingDestination) {
      setDestinations(prev => prev.map(dest => 
        dest.id === editingDestination.id 
          ? { ...dest, ...formData }
          : dest
      ));
      toast.success("Destination updated successfully");
    } else {
      const newDestination: Destination = {
        id: Date.now().toString(),
        ...formData,
      };
      setDestinations(prev => [...prev, newDestination]);
      toast.success("Destination added successfully");
    }
    
    setIsDialogOpen(false);
    setEditingDestination(null);
    setFormData({ name: '', country: '', region: '', type: 'domestic', is_active: true });
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      country: destination.country,
      region: destination.region,
      type: destination.type,
      is_active: destination.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDestinations(prev => prev.filter(dest => dest.id !== id));
    toast.success("Destination deleted successfully");
  };

  const toggleStatus = (id: string) => {
    setDestinations(prev => prev.map(dest => 
      dest.id === id ? { ...dest, is_active: !dest.is_active } : dest
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Destination Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage destinations for inquiries and quotes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Destination
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDestination ? 'Edit Destination' : 'Add New Destination'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Destination Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Nairobi"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g., Kenya"
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="e.g., Central Kenya"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'domestic' | 'international' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">Domestic</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingDestination ? 'Update' : 'Add'} Destination
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
                <TableHead>Country</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {destinations.map((destination) => (
                <TableRow key={destination.id}>
                  <TableCell className="font-medium">{destination.name}</TableCell>
                  <TableCell>{destination.country}</TableCell>
                  <TableCell>{destination.region}</TableCell>
                  <TableCell>
                    <Badge variant={destination.type === 'domestic' ? 'default' : 'secondary'}>
                      {destination.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={destination.is_active}
                      onCheckedChange={() => toggleStatus(destination.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(destination)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(destination.id)}
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
