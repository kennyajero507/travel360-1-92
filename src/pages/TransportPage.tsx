import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Plane,
  Car,
  Bus,
  Ship,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react';

// Mock transport data
const mockTransports = [
  {
    id: '1',
    type: 'flight',
    operator: 'Kenya Airways',
    route: 'Nairobi - Zanzibar',
    departure_time: '08:30',
    arrival_time: '10:15',
    duration: '1h 45m',
    capacity: 180,
    price_per_person: 350,
    currency: 'USD',
    status: 'active',
    frequency: 'Daily'
  },
  {
    id: '2',
    type: 'vehicle',
    operator: 'Safari Vehicles Ltd',
    route: 'Nairobi - Maasai Mara',
    departure_time: '06:00',
    arrival_time: '11:30',
    duration: '5h 30m',
    capacity: 7,
    price_per_person: 120,
    currency: 'USD',
    status: 'active',
    frequency: 'Daily'
  },
  {
    id: '3',
    type: 'bus',
    operator: 'Coastal Express',
    route: 'Mombasa - Diani Beach',
    departure_time: '09:00',
    arrival_time: '10:30',
    duration: '1h 30m',
    capacity: 45,
    price_per_person: 25,
    currency: 'USD',
    status: 'active',
    frequency: 'Hourly'
  },
  {
    id: '4',
    type: 'ferry',
    operator: 'Ocean Ferries',
    route: 'Dar es Salaam - Stone Town',
    departure_time: '14:00',
    arrival_time: '16:30',
    duration: '2h 30m',
    capacity: 200,
    price_per_person: 45,
    currency: 'USD',
    status: 'maintenance',
    frequency: 'Twice Daily'
  }
];

const TransportPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'vehicle': return <Car className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'ferry': return <Ship className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const filteredTransports = mockTransports.filter(transport => {
    const matchesSearch = transport.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.route.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || transport.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transport.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transport Management</h1>
          <p className="text-gray-600 mt-1">Manage transportation options and operators</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Transport
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              Across all transport types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$135</div>
            <p className="text-xs text-muted-foreground">
              Per person per trip
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground">
              Passengers per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Transport Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search operators or routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Transport type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="flight">Flights</SelectItem>
                <SelectItem value="vehicle">Vehicles</SelectItem>
                <SelectItem value="bus">Buses</SelectItem>
                <SelectItem value="ferry">Ferries</SelectItem>
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
            {filteredTransports.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transport options found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by adding a new transport option.'
                  }
                </p>
                {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                  <div className="mt-6">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transport
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              filteredTransports.map((transport) => (
                <Card key={transport.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            {getTransportIcon(transport.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {transport.operator}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">{transport.type}</p>
                          </div>
                          <Badge className={getStatusColor(transport.status)}>
                            {transport.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{transport.route}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{transport.departure_time} - {transport.arrival_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>Capacity: {transport.capacity}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>{formatCurrency(transport.price_per_person, transport.currency)}/person</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Duration: {transport.duration}</span>
                            <span>Frequency: {transport.frequency}</span>
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

export default TransportPage;