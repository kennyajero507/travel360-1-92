import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHotels } from '../hooks/useHotels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Building,
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Waves,
  Edit,
  Eye,
  MoreHorizontal,
  DollarSign
} from 'lucide-react';

// Mock hotel data
const mockHotels = [
  {
    id: '1',
    name: 'Zanzibar Beach Resort',
    category: '5-star',
    location: 'Stone Town, Zanzibar',
    destination: 'Zanzibar',
    description: 'Luxury beachfront resort with world-class amenities',
    room_count: 150,
    status: 'active',
    pricing: {
      standard: 280,
      deluxe: 420,
      suite: 650
    },
    amenities: ['wifi', 'parking', 'restaurant', 'pool', 'spa', 'gym'],
    rating: 4.8,
    images: ['hotel1.jpg'],
    contact: {
      phone: '+255 24 223 1000',
      email: 'info@zanzibarresort.com'
    }
  },
  {
    id: '2',
    name: 'Serengeti Safari Lodge',
    category: '4-star',
    location: 'Central Serengeti',
    destination: 'Serengeti',
    description: 'Authentic safari experience in the heart of Serengeti',
    room_count: 75,
    status: 'active',
    pricing: {
      standard: 450,
      deluxe: 650,
      suite: 950
    },
    amenities: ['wifi', 'restaurant', 'bar', 'game_drives'],
    rating: 4.6,
    images: ['hotel2.jpg'],
    contact: {
      phone: '+255 27 254 4000',
      email: 'reservations@serengetilodge.com'
    }
  },
  {
    id: '3',
    name: 'Nairobi City Hotel',
    category: '4-star',
    location: 'Westlands, Nairobi',
    destination: 'Nairobi',
    description: 'Modern business hotel in the heart of Nairobi',
    room_count: 200,
    status: 'maintenance',
    pricing: {
      standard: 150,
      deluxe: 220,
      suite: 380
    },
    amenities: ['wifi', 'parking', 'restaurant', 'gym', 'business_center'],
    rating: 4.2,
    images: ['hotel3.jpg'],
    contact: {
      phone: '+254 20 444 4000',
      email: 'info@nairobicity.com'
    }
  }
];

const HotelsPage = () => {
  const { hotels, loading } = useHotels();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'parking': return <Car className="h-4 w-4" />;
      case 'restaurant': return <Coffee className="h-4 w-4" />;
      case 'pool': return <Waves className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || hotel.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || hotel.status === statusFilter;
    const matchesDestination = destinationFilter === 'all' || hotel.destination === destinationFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDestination;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotels Management</h1>
          <p className="text-gray-600 mt-1">Manage your hotel inventory and partnerships</p>
        </div>
        <Button asChild>
          <Link to="/hotels/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Hotel
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,150</div>
            <p className="text-xs text-muted-foreground">
              Across all properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$280</div>
            <p className="text-xs text-muted-foreground">
              Per night average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5</div>
            <p className="text-xs text-muted-foreground">
              Guest satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Hotel Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search hotels or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="5-star">5 Star</SelectItem>
                <SelectItem value="4-star">4 Star</SelectItem>
                <SelectItem value="3-star">3 Star</SelectItem>
                <SelectItem value="boutique">Boutique</SelectItem>
              </SelectContent>
            </Select>
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Destinations</SelectItem>
                <SelectItem value="Zanzibar">Zanzibar</SelectItem>
                <SelectItem value="Serengeti">Serengeti</SelectItem>
                <SelectItem value="Nairobi">Nairobi</SelectItem>
                <SelectItem value="Mombasa">Mombasa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredHotels.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hotels found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by adding a new hotel.'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                  <div className="mt-6">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hotel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              filteredHotels.map((hotel) => (
                <Card key={hotel.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {hotel.name}
                              </h3>
                              <Badge className={getStatusColor(hotel.status)}>
                                {hotel.status}
                              </Badge>
                              <Badge variant="outline">{hotel.category}</Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{hotel.location}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              {hotel.rating ? renderStars(hotel.rating) : (
                                <div className="flex gap-1">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star key={i} className="h-4 w-4 text-gray-300" />
                                  ))}
                                </div>
                              )}
                              <span className="text-sm text-gray-600">
                                {hotel.rating ? `(${hotel.rating})` : 'No rating'}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600">{hotel.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Room Count</p>
                            <p className="text-lg font-semibold">
                              {hotel.room_count || 'N/A'} rooms
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Price Range</p>
                            <p className="text-lg font-semibold">
                              {hotel.pricing ? (
                                `${formatCurrency(hotel.pricing.standard || 0)} - ${formatCurrency(hotel.pricing.suite || 0)}`
                              ) : (
                                'Contact for pricing'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Contact</p>
                            <p className="text-sm text-gray-600">
                              {hotel.contact_info?.phone || 'No phone'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {hotel.contact_info?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm font-medium text-gray-700">Amenities:</span>
                          <div className="flex gap-2">
                            {hotel.amenities && Array.isArray(hotel.amenities) ? (
                              hotel.amenities.slice(0, 5).map((amenity, index) => (
                                <div key={index} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                  {getAmenityIcon(amenity)}
                                  <span className="capitalize">{amenity.replace('_', ' ')}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">No amenities listed</span>
                            )}
                            {hotel.amenities && hotel.amenities.length > 5 && (
                              <span className="text-xs text-gray-500">+{hotel.amenities.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelsPage;