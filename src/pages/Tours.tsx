
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Plus, Search, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import CurrencyDisplay from '../components/quote/CurrencyDisplay';

const Tours = () => {
  const { currencies } = useCurrency();
  const [selectedTourType, setSelectedTourType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock tour templates data - in real app this would come from the database
  const tourTemplates = [
    {
      id: '1',
      title: 'Maasai Mara Safari Experience',
      destination: 'Maasai Mara',
      duration_days: 3,
      duration_nights: 2,
      base_price: 45000,
      currency_code: 'KES',
      tour_type: 'domestic',
      description: 'Experience the world-famous Maasai Mara with game drives and cultural visits.',
      country: 'Kenya',
      region: 'Rift Valley',
      is_active: true,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      title: 'Mount Kenya Climbing Adventure',
      destination: 'Mount Kenya',
      duration_days: 5,
      duration_nights: 4,
      base_price: 65000,
      currency_code: 'KES',
      tour_type: 'domestic',
      description: 'Challenge yourself with a climb to Point Lenana on Mount Kenya.',
      country: 'Kenya',
      region: 'Central',
      is_active: true,
      created_at: '2024-01-10'
    },
    {
      id: '3',
      title: 'East Africa Grand Tour',
      destination: 'Kenya, Tanzania, Uganda',
      duration_days: 14,
      duration_nights: 13,
      base_price: 2500,
      currency_code: 'USD',
      tour_type: 'international',
      description: 'Complete East Africa experience covering multiple countries.',
      country: 'Multi-Country',
      region: 'East Africa',
      is_active: true,
      created_at: '2024-01-05'
    }
  ];

  const filteredTours = tourTemplates.filter(tour => {
    const matchesType = selectedTourType === 'all' || tour.tour_type === selectedTourType;
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tour Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable tour packages</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Tour Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Tours</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="tour-type">Tour Type</Label>
              <Select value={selectedTourType} onValueChange={setSelectedTourType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tours</SelectItem>
                  <SelectItem value="domestic">Domestic</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTours.map((tour) => (
          <Card key={tour.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{tour.title}</CardTitle>
                <Badge variant={tour.tour_type === 'domestic' ? 'default' : 'secondary'}>
                  {tour.tour_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {tour.destination}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {tour.duration_days} days, {tour.duration_nights} nights
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                <CurrencyDisplay amount={tour.base_price} currencyCode={tour.currency_code} />
                <span className="ml-1">per person</span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3">
                {tour.description}
              </p>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  Edit Template
                </Button>
                <Button className="flex-1">
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTours.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tour templates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedTourType !== 'all' 
                ? 'Try adjusting your search criteria.' 
                : 'Get started by creating your first tour template.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Tour Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tours;
