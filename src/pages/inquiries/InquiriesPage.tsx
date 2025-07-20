import React, { useState } from 'react';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Calendar, 
  Users, 
  MapPin,
  Clock,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data - replace with actual API calls
const mockInquiries = [
  {
    id: '1',
    inquiry_id: 'ENQ-2501-001',
    client_name: 'Sarah Johnson',
    client_email: 'sarah@email.com',
    client_phone: '+1-555-0123',
    destination: 'Zanzibar, Tanzania',
    travel_type: 'international' as const,
    travel_start: '2025-03-15',
    travel_end: '2025-03-22',
    number_of_guests: 2,
    status: 'new' as const,
    assigned_agent_id: null,
    created_at: '2025-01-15T10:30:00Z',
    special_requests: 'Honeymoon package, beachfront accommodation preferred'
  },
  {
    id: '2',
    inquiry_id: 'ENQ-2501-002',
    client_name: 'Michael Chen',
    client_email: 'michael.chen@email.com',
    client_phone: '+1-555-0124',
    destination: 'Serengeti National Park',
    travel_type: 'international' as const,
    travel_start: '2025-04-10',
    travel_end: '2025-04-17',
    number_of_guests: 4,
    status: 'assigned' as const,
    assigned_agent_id: 'agent-1',
    created_at: '2025-01-14T14:20:00Z',
    special_requests: 'Family safari, child-friendly accommodations'
  },
  {
    id: '3',
    inquiry_id: 'ENQ-2501-003',
    client_name: 'Emily Rodriguez',
    client_email: 'emily.r@email.com',
    destination: 'Nairobi City Tour',
    travel_type: 'domestic' as const,
    travel_start: '2025-02-20',
    travel_end: '2025-02-23',
    number_of_guests: 1,
    status: 'quoted' as const,
    assigned_agent_id: 'agent-2',
    created_at: '2025-01-13T09:15:00Z'
  }
];

const InquiriesPage = () => {
  const { profile } = useSimpleAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInquiries = mockInquiries.filter(inquiry => {
    const matchesSearch = inquiry.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.inquiry_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInquiriesByStatus = (status: string) => {
    if (status === 'all') return mockInquiries;
    return mockInquiries.filter(inquiry => inquiry.status === status);
  };

  const canCreateInquiry = profile?.role === 'customer_service' || 
                          profile?.role === 'agent' || 
                          profile?.role === 'tour_operator' || 
                          profile?.role === 'org_owner';

  const canAssignAgents = profile?.role === 'tour_operator' || 
                         profile?.role === 'org_owner';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage and track client travel inquiries</p>
        </div>
        {canCreateInquiry && (
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link to="/inquiries/create">
              <Plus className="h-4 w-4 mr-2" />
              New Inquiry
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Inquiries</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getInquiriesByStatus('new').length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getInquiriesByStatus('assigned').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quoted</p>
                <p className="text-2xl font-bold text-green-600">
                  {getInquiriesByStatus('quoted').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockInquiries.length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by client name, destination, or inquiry ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="quoted">Quoted</option>
                <option value="booked">Booked</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {inquiry.inquiry_id}
                      </h3>
                      <Badge className={getStatusColor(inquiry.status)}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {inquiry.travel_type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{inquiry.client_name}</p>
                          <p className="text-xs text-gray-500">{inquiry.number_of_guests} guests</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{inquiry.destination}</p>
                          <p className="text-xs text-gray-500">Destination</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(inquiry.travel_start).toLocaleDateString()} - {new Date(inquiry.travel_end).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Travel dates</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Created</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {inquiry.client_email}
                      </div>
                      {inquiry.client_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {inquiry.client_phone}
                        </div>
                      )}
                    </div>

                    {inquiry.special_requests && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Special Requests:</span> {inquiry.special_requests}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button asChild size="sm">
                      <Link to={`/inquiries/${inquiry.id}`}>
                        View Details
                      </Link>
                    </Button>
                    
                    {inquiry.status === 'new' && canAssignAgents && (
                      <Button variant="outline" size="sm">
                        Assign Agent
                      </Button>
                    )}
                    
                    {inquiry.status === 'assigned' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/quotes/create?inquiry=${inquiry.id}`}>
                          Create Quote
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredInquiries.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first inquiry'
                  }
                </p>
                {canCreateInquiry && (
                  <Button asChild>
                    <Link to="/inquiries/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Inquiry
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['new', 'assigned', 'quoted', 'booked', 'cancelled'].map((status) => (
              <Card key={status}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium capitalize">
                    {status} ({getInquiriesByStatus(status).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getInquiriesByStatus(status).map((inquiry) => (
                    <Card key={inquiry.id} className="p-3 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">
                            {inquiry.inquiry_id}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {inquiry.travel_type}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm">{inquiry.client_name}</h4>
                        <p className="text-xs text-gray-600">{inquiry.destination}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {inquiry.number_of_guests} guests
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InquiriesPage;