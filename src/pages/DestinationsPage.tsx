import { useState, useEffect } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { MapPin, Plus, Search, Filter, Globe, Camera, Star, Clock, DollarSign } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  category: string;
  best_time_to_visit: string;
  avg_temperature: string;
  currency: string;
  language: string;
  highlights: string[];
  activities: string[];
  images: string[];
  status: 'active' | 'inactive';
  created_at: string;
  org_id: string;
}

const DestinationsPage = () => {
  const { profile } = useSimpleAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [destinationForm, setDestinationForm] = useState({
    name: '',
    country: 'Kenya',
    region: '',
    description: '',
    category: 'safari',
    best_time_to_visit: '',
    avg_temperature: '',
    currency: 'KES',
    language: 'English',
    highlights: '',
    activities: '',
    status: 'active' as 'active' | 'inactive'
  });

  const categories = [
    { value: 'safari', label: 'Safari & Wildlife', color: 'default' },
    { value: 'beach', label: 'Beach & Coast', color: 'secondary' },
    { value: 'culture', label: 'Cultural Sites', color: 'outline' },
    { value: 'adventure', label: 'Adventure', color: 'destructive' },
    { value: 'city', label: 'City Tours', color: 'secondary' },
    { value: 'nature', label: 'Nature & Parks', color: 'default' }
  ];

  const countries = [
    'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Ethiopia', 'Botswana', 'South Africa', 'Namibia', 'Zambia', 'Zimbabwe'
  ];

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      // Mock data for now since we don't have destinations table
      const mockDestinations: Destination[] = [
        {
          id: '1',
          name: 'Maasai Mara National Reserve',
          country: 'Kenya',
          region: 'Narok County',
          description: 'World-famous for the Great Migration, Maasai Mara offers exceptional wildlife viewing year-round.',
          category: 'safari',
          best_time_to_visit: 'July - October',
          avg_temperature: '24°C',
          currency: 'KES',
          language: 'English, Swahili',
          highlights: ['Great Migration', 'Big Five', 'Maasai Culture'],
          activities: ['Game Drives', 'Hot Air Balloon', 'Cultural Visits'],
          images: [],
          status: 'active',
          created_at: new Date().toISOString(),
          org_id: profile?.org_id || ''
        },
        {
          id: '2',
          name: 'Diani Beach',
          country: 'Kenya',
          region: 'Kwale County',
          description: 'Pristine white sand beach with crystal clear waters and vibrant coral reefs.',
          category: 'beach',
          best_time_to_visit: 'December - March',
          avg_temperature: '28°C',
          currency: 'KES',
          language: 'English, Swahili',
          highlights: ['White Sand Beach', 'Coral Reefs', 'Water Sports'],
          activities: ['Snorkeling', 'Diving', 'Kite Surfing'],
          images: [],
          status: 'active',
          created_at: new Date().toISOString(),
          org_id: profile?.org_id || ''
        }
      ];
      setDestinations(mockDestinations);
    } catch (error: any) {
      console.error('Error fetching destinations:', error);
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const saveDestination = async () => {
    try {
      const destinationData = {
        ...destinationForm,
        highlights: destinationForm.highlights.split(',').map(h => h.trim()).filter(h => h),
        activities: destinationForm.activities.split(',').map(a => a.trim()).filter(a => a),
        org_id: profile?.org_id
      };

      if (editingDestination) {
        // Update existing destination
        setDestinations(prev => prev.map(d => 
          d.id === editingDestination.id 
            ? { ...d, ...destinationData }
            : d
        ));
        toast.success('Destination updated successfully');
      } else {
        // Create new destination
        const newDestination: Destination = {
          id: Date.now().toString(),
          ...destinationData,
          created_at: new Date().toISOString()
        } as Destination;
        setDestinations(prev => [newDestination, ...prev]);
        toast.success('Destination created successfully');
      }

      setShowCreateDialog(false);
      setEditingDestination(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving destination:', error);
      toast.error('Failed to save destination');
    }
  };

  const resetForm = () => {
    setDestinationForm({
      name: '',
      country: 'Kenya',
      region: '',
      description: '',
      category: 'safari',
      best_time_to_visit: '',
      avg_temperature: '',
      currency: 'KES',
      language: 'English',
      highlights: '',
      activities: '',
      status: 'active'
    });
  };

  const editDestination = (destination: Destination) => {
    setEditingDestination(destination);
    setDestinationForm({
      name: destination.name,
      country: destination.country,
      region: destination.region,
      description: destination.description,
      category: destination.category,
      best_time_to_visit: destination.best_time_to_visit,
      avg_temperature: destination.avg_temperature,
      currency: destination.currency,
      language: destination.language,
      highlights: destination.highlights.join(', '),
      activities: destination.activities.join(', '),
      status: destination.status
    });
    setShowCreateDialog(true);
  };

  const deleteDestination = async (id: string) => {
    try {
      setDestinations(prev => prev.filter(d => d.id !== id));
      toast.success('Destination deleted successfully');
    } catch (error: any) {
      console.error('Error deleting destination:', error);
      toast.error('Failed to delete destination');
    }
  };

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || destination.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    const categoryConfig = categories.find(c => c.value === category);
    return categoryConfig?.color || 'secondary';
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
          <p className="text-gray-600 mt-2">Manage your travel destinations and packages</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            setEditingDestination(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Destination
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDestination ? 'Edit Destination' : 'Add New Destination'}
              </DialogTitle>
              <DialogDescription>
                {editingDestination ? 'Update destination information' : 'Create a new travel destination'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Destination Name</Label>
                  <Input
                    id="name"
                    value={destinationForm.name}
                    onChange={(e) => setDestinationForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Maasai Mara National Reserve"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    value={destinationForm.country}
                    onChange={(e) => setDestinationForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={destinationForm.region}
                    onChange={(e) => setDestinationForm(prev => ({ ...prev, region: e.target.value }))}
                    placeholder="Narok County"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={destinationForm.category}
                    onChange={(e) => setDestinationForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={destinationForm.description}
                  onChange={(e) => setDestinationForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the destination..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="best_time">Best Time to Visit</Label>
                  <Input
                    id="best_time"
                    value={destinationForm.best_time_to_visit}
                    onChange={(e) => setDestinationForm(prev => ({ ...prev, best_time_to_visit: e.target.value }))}
                    placeholder="July - October"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Average Temperature</Label>
                  <Input
                    id="temperature"
                    value={destinationForm.avg_temperature}
                    onChange={(e) => setDestinationForm(prev => ({ ...prev, avg_temperature: e.target.value }))}
                    placeholder="24°C"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={destinationForm.currency}
                    onChange={(e) => setDestinationForm(prev => ({ ...prev, currency: e.target.value }))}
                    placeholder="KES"
                  />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={destinationForm.language}
                    onChange={(e) => setDestinationForm(prev => ({ ...prev, language: e.target.value }))}
                    placeholder="English, Swahili"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="highlights">Highlights (comma separated)</Label>
                <Input
                  id="highlights"
                  value={destinationForm.highlights}
                  onChange={(e) => setDestinationForm(prev => ({ ...prev, highlights: e.target.value }))}
                  placeholder="Great Migration, Big Five, Maasai Culture"
                />
              </div>

              <div>
                <Label htmlFor="activities">Activities (comma separated)</Label>
                <Input
                  id="activities"
                  value={destinationForm.activities}
                  onChange={(e) => setDestinationForm(prev => ({ ...prev, activities: e.target.value }))}
                  placeholder="Game Drives, Hot Air Balloon, Cultural Visits"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveDestination}>
                  {editingDestination ? 'Update' : 'Create'} Destination
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="destinations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="destinations">All Destinations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="packages">Package Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="destinations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Destinations ({filteredDestinations.length})
                  </CardTitle>
                  <CardDescription>
                    Manage your travel destinations and their details
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search destinations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading destinations...</p>
                </div>
              ) : filteredDestinations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No destinations found</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowCreateDialog(true)}
                  >
                    Add Your First Destination
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDestinations.map((destination) => (
                    <Card key={destination.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{destination.name}</CardTitle>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <Globe className="h-3 w-3" />
                              {destination.country}, {destination.region}
                            </div>
                          </div>
                          <Badge variant={getCategoryBadgeColor(destination.category) as any}>
                            {categories.find(c => c.value === destination.category)?.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {destination.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>Best time: {destination.best_time_to_visit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-gray-400" />
                            <span>Temperature: {destination.avg_temperature}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-gray-400" />
                            <span>Currency: {destination.currency}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Highlights:</p>
                          <div className="flex flex-wrap gap-1">
                            {destination.highlights.slice(0, 3).map((highlight, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                            {destination.highlights.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{destination.highlights.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <Badge variant={destination.status === 'active' ? 'default' : 'secondary'}>
                            {destination.status}
                          </Badge>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => editDestination(destination)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this destination?')) {
                                  deleteDestination(destination.id);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Destination Analytics</CardTitle>
              <CardDescription>
                Performance metrics for your destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Destination analytics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <CardTitle>Package Templates</CardTitle>
              <CardDescription>
                Pre-built packages for your destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Package templates coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DestinationsPage;