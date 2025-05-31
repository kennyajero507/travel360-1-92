
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PackageTemplate {
  id: string;
  title: string;
  description: string;
  days: number;
  nights: number;
  destination: string;
  type: 'domestic' | 'international';
}

export const PackageTemplates = () => {
  const [packages, setPackages] = useState<PackageTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    days: 1,
    nights: 0,
    destination: '',
    type: 'domestic' as 'domestic' | 'international',
  });

  // Mock data
  useEffect(() => {
    setPackages([
      {
        id: '1',
        title: '5 Days Dubai Package',
        description: 'Luxury Dubai experience with city tour and desert safari',
        days: 5,
        nights: 4,
        destination: 'Dubai',
        type: 'international'
      },
      {
        id: '2',
        title: '3 Days Mombasa Beach Holiday',
        description: 'Relaxing beach vacation with water sports',
        days: 3,
        nights: 2,
        destination: 'Mombasa',
        type: 'domestic'
      }
    ]);
  }, []);

  const handleSave = () => {
    if (editingPackage) {
      setPackages(prev => prev.map(pkg => 
        pkg.id === editingPackage.id 
          ? { ...pkg, ...formData }
          : pkg
      ));
      toast.success("Package template updated successfully");
    } else {
      const newPackage: PackageTemplate = {
        id: Date.now().toString(),
        ...formData,
      };
      setPackages(prev => [...prev, newPackage]);
      toast.success("Package template added successfully");
    }
    
    setIsDialogOpen(false);
    setEditingPackage(null);
    setFormData({ title: '', description: '', days: 1, nights: 0, destination: '', type: 'domestic' });
  };

  const handleEdit = (packageTemplate: PackageTemplate) => {
    setEditingPackage(packageTemplate);
    setFormData({
      title: packageTemplate.title,
      description: packageTemplate.description,
      days: packageTemplate.days,
      nights: packageTemplate.nights,
      destination: packageTemplate.destination,
      type: packageTemplate.type,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPackages(prev => prev.filter(pkg => pkg.id !== id));
    toast.success("Package template deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Package Templates</h3>
          <p className="text-sm text-muted-foreground">
            Create predefined packages for quick inquiry and quote creation
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Package Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Edit Package Template' : 'Add New Package Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Package Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 5 Days Dubai Package"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the package"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="days">Days</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    value={formData.days}
                    onChange={(e) => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) || 1, nights: Math.max(0, parseInt(e.target.value) - 1 || 0) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nights">Nights</Label>
                  <Input
                    id="nights"
                    type="number"
                    min="0"
                    value={formData.nights}
                    onChange={(e) => setFormData(prev => ({ ...prev, nights: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="e.g., Dubai"
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingPackage ? 'Update' : 'Add'} Package
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
                <TableHead>Title</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((packageTemplate) => (
                <TableRow key={packageTemplate.id}>
                  <TableCell className="font-medium">{packageTemplate.title}</TableCell>
                  <TableCell>{packageTemplate.destination}</TableCell>
                  <TableCell>{packageTemplate.days}D/{packageTemplate.nights}N</TableCell>
                  <TableCell>
                    <Badge variant={packageTemplate.type === 'domestic' ? 'default' : 'secondary'}>
                      {packageTemplate.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{packageTemplate.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(packageTemplate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(packageTemplate.id)}
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
