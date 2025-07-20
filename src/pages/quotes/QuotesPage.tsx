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
  FileText, 
  Calendar, 
  Users, 
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  Eye,
  Send,
  Download,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data - replace with actual API calls
const mockQuotes = [
  {
    id: '1',
    quote_id: 'QUO-2501-001',
    inquiry_id: 'ENQ-2501-001',
    client_name: 'Sarah Johnson',
    client_email: 'sarah@email.com',
    destination: 'Zanzibar, Tanzania',
    travel_start: '2025-03-15',
    travel_end: '2025-03-22',
    number_of_guests: 2,
    subtotal: 3200,
    markup_percentage: 15,
    markup_amount: 480,
    total_price: 3680,
    currency: 'USD',
    status: 'draft' as const,
    valid_until: '2025-02-15',
    created_at: '2025-01-15T11:30:00Z',
    hotels: [
      {
        hotel_name: 'Zanzibar Beach Resort',
        hotel_category: '4-star',
        location: 'Stone Town',
        check_in: '2025-03-15',
        check_out: '2025-03-22',
        nights: 7,
        room_type: 'Ocean View Suite',
        meal_plan: 'Half Board',
        cost_per_night: 200,
        total_cost: 1400,
        is_primary: true
      }
    ]
  },
  {
    id: '2',
    quote_id: 'QUO-2501-002',
    inquiry_id: 'ENQ-2501-002',
    client_name: 'Michael Chen',
    client_email: 'michael.chen@email.com',
    destination: 'Serengeti National Park',
    travel_start: '2025-04-10',
    travel_end: '2025-04-17',
    number_of_guests: 4,
    subtotal: 8500,
    markup_percentage: 20,
    markup_amount: 1700,
    total_price: 10200,
    currency: 'USD',
    status: 'pending' as const,
    valid_until: '2025-03-10',
    created_at: '2025-01-14T15:20:00Z',
    hotels: [
      {
        hotel_name: 'Serengeti Safari Lodge',
        hotel_category: '5-star',
        location: 'Central Serengeti',
        check_in: '2025-04-10',
        check_out: '2025-04-17',
        nights: 7,
        room_type: 'Safari Suite',
        meal_plan: 'Full Board',
        cost_per_night: 450,
        total_cost: 3150,
        is_primary: true
      }
    ]
  },
  {
    id: '3',
    quote_id: 'QUO-2501-003',
    inquiry_id: 'ENQ-2501-003',
    client_name: 'Emily Rodriguez',
    client_email: 'emily.r@email.com',
    destination: 'Nairobi City Tour',
    travel_start: '2025-02-20',
    travel_end: '2025-02-23',
    number_of_guests: 1,
    subtotal: 800,
    markup_percentage: 12,
    markup_amount: 96,
    total_price: 896,
    currency: 'USD',
    status: 'approved' as const,
    valid_until: '2025-02-10',
    created_at: '2025-01-13T10:15:00Z',
    hotels: [
      {
        hotel_name: 'Nairobi Serena Hotel',
        hotel_category: '5-star',
        location: 'Central Nairobi',
        check_in: '2025-02-20',
        check_out: '2025-02-23',
        nights: 3,
        room_type: 'Deluxe Room',
        meal_plan: 'Breakfast',
        cost_per_night: 180,
        total_cost: 540,
        is_primary: true
      }
    ]
  }
];

const QuotesPage = () => {
  const { profile } = useSimpleAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQuotes = mockQuotes.filter(quote => {
    const matchesSearch = quote.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quote_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getQuotesByStatus = (status: string) => {
    if (status === 'all') return mockQuotes;
    return mockQuotes.filter(quote => quote.status === status);
  };

  const canCreateQuote = profile?.role === 'agent' || 
                        profile?.role === 'tour_operator' || 
                        profile?.role === 'org_owner';

  const canApproveQuotes = profile?.role === 'tour_operator' || 
                          profile?.role === 'org_owner';

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Quotes</h1>
          <p className="text-gray-600 mt-1">Create and manage travel quotes for clients</p>
        </div>
        {canCreateQuote && (
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <Link to="/quotes/create">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
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
                <p className="text-sm font-medium text-gray-600">Draft Quotes</p>
                <p className="text-2xl font-bold text-gray-600">
                  {getQuotesByStatus('draft').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getQuotesByStatus('pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {getQuotesByStatus('approved').length}
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
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(mockQuotes.reduce((sum, quote) => sum + quote.total_price, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
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
                  placeholder="Search by client name, destination, or quote ID..."
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
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {quote.quote_id}
                    </h3>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {quote.number_of_guests} guests
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{quote.client_name}</p>
                        <p className="text-xs text-gray-500">Client</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{quote.destination}</p>
                        <p className="text-xs text-gray-500">Destination</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(quote.travel_start).toLocaleDateString()} - {new Date(quote.travel_end).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">Travel dates</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(quote.total_price, quote.currency)}
                        </p>
                        <p className="text-xs text-gray-500">Total price</p>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Information */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Hotels Included:</h4>
                    {quote.hotels.map((hotel, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{hotel.hotel_name}</span>
                          <span className="text-gray-500 ml-2">({hotel.hotel_category})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{hotel.nights} nights</span>
                          <span className="text-gray-500 ml-2">{hotel.room_type}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Subtotal</p>
                        <p className="font-medium">{formatCurrency(quote.subtotal, quote.currency)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Markup ({quote.markup_percentage}%)</p>
                        <p className="font-medium text-blue-600">{formatCurrency(quote.markup_amount, quote.currency)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Price</p>
                        <p className="font-bold text-green-600">{formatCurrency(quote.total_price, quote.currency)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {quote.client_email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Valid until {new Date(quote.valid_until).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button asChild size="sm">
                    <Link to={`/quotes/${quote.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  
                  {quote.status === 'draft' && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/quotes/${quote.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  )}
                  
                  {(quote.status === 'draft' || quote.status === 'pending') && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/quotes/${quote.id}/preview`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Client Preview
                      </Link>
                    </Button>
                  )}
                  
                  {quote.status === 'pending' && canApproveQuotes && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                  )}
                  
                  {quote.status === 'approved' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                      <Link to={`/bookings/create?quote=${quote.id}`}>
                        Create Booking
                      </Link>
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredQuotes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first quote'
                }
              </p>
              {canCreateQuote && (
                <Button asChild>
                  <Link to="/quotes/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Quote
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuotesPage;