import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { useQuotes } from '../../hooks/useQuotes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Calendar, 
  MapPin, 
  Mail, 
  Clock,
  FileText,
  Send,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  Plane
} from 'lucide-react';
import type { Quote } from '../../types/quote';
import { formatCurrency } from '../../utils/quoteCalculations';

const QuoteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useSimpleAuth();
  const { quotes, loading, updateQuote } = useQuotes();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (quotes.length > 0 && id) {
      const foundQuote = quotes.find(q => q.id === id);
      setQuote(foundQuote || null);
    }
  }, [quotes, id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'booked': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!quote) return;
    
    setIsUpdating(true);
    try {
      await updateQuote(quote.id, { status: newStatus });
      setQuote(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendToClient = async () => {
    if (!quote) return;
    
    setIsUpdating(true);
    try {
      await updateQuote(quote.id, { 
        status: 'pending',
        sent_to_client_at: new Date().toISOString()
      });
      setQuote(prev => prev ? { 
        ...prev, 
        status: 'pending',
        sent_to_client_at: new Date().toISOString()
      } : null);
      toast.success('Quote sent to client successfully');
    } catch (error) {
      toast.error('Failed to send quote');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Quote not found</h3>
        <p className="mt-1 text-sm text-gray-500">The quote you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/quotes">Back to Quotes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalGuests = (quote.adults || 0) + 
                     (quote.children_with_bed || 0) + 
                     (quote.children_no_bed || 0) + 
                     (quote.infants || 0);

  const canManageQuote = profile?.role === 'org_owner' || profile?.role === 'tour_operator' || quote.created_by === profile?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/quotes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotes
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {quote.quote_number || `Quote-${quote.id.slice(0, 8)}`}
            </h1>
            <p className="text-gray-600 mt-1">Quote details and management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(quote.status)}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </Badge>
          {canManageQuote && quote.status === 'draft' && (
            <Button asChild variant="outline">
              <Link to={`/quotes/${quote.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Quote
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pricing">Pricing Breakdown</TabsTrigger>
              <TabsTrigger value="inclusions">Inclusions & Exclusions</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Client & Travel Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Quote Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Client Name</p>
                      <p className="text-lg font-semibold">{quote.client}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Guests</p>
                      <p className="text-lg font-semibold">{totalGuests} guests</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Destination</p>
                        <p className="text-sm">{quote.destination}</p>
                      </div>
                    </div>
                    {quote.client_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email</p>
                          <p className="text-sm">{quote.client_email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Travel Dates</p>
                        <p className="text-sm">
                          {new Date(quote.start_date).toLocaleDateString()} - {new Date(quote.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Duration</p>
                        <p className="text-sm">{quote.duration_nights} nights, {quote.duration_days} days</p>
                      </div>
                    </div>
                  </div>

                  {quote.package_name && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Package Name</p>
                      <Badge variant="outline">{quote.package_name}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guest Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Guest Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{quote.adults || 0}</p>
                      <p className="text-sm text-blue-800">Adults</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{quote.children_with_bed || 0}</p>
                      <p className="text-sm text-green-800">Children with Bed</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{quote.children_no_bed || 0}</p>
                      <p className="text-sm text-yellow-800">Children no Bed</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{quote.infants || 0}</p>
                      <p className="text-sm text-purple-800">Infants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(quote.subtotal || 0, quote.currency_code || 'USD')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">
                        Markup ({quote.markup_percentage || 0}%)
                      </span>
                      <span className="text-sm text-green-600">
                        +{formatCurrency(quote.markup_amount || 0, quote.currency_code || 'USD')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg">
                      <span className="text-lg font-bold">Total Amount</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(quote.total_amount || 0, quote.currency_code || 'USD')}
                      </span>
                    </div>
                  </div>

                  {quote.payment_terms && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">Payment Terms</p>
                      <p className="text-sm text-gray-700">{quote.payment_terms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inclusions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Inclusions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quote.inclusions && quote.inclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {quote.inclusions.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No inclusions specified</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <XCircle className="h-5 w-5" />
                      Exclusions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quote.exclusions && quote.exclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {quote.exclusions.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No exclusions specified</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {quote.terms_conditions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {quote.terms_conditions}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Quote Timeline</CardTitle>
                  <CardDescription>Track the progress of this quote</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Quote Created</p>
                        <p className="text-sm text-gray-600">
                          {new Date(quote.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {quote.sent_to_client_at && (
                      <div className="flex items-start gap-4">
                        <div className="bg-yellow-100 p-2 rounded-full">
                          <Send className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Sent to Client</p>
                          <p className="text-sm text-gray-600">
                            {new Date(quote.sent_to_client_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {quote.client_viewed_at && (
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Eye className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Viewed by Client</p>
                          <p className="text-sm text-gray-600">
                            {new Date(quote.client_viewed_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {quote.status === 'booked' && (
                      <div className="flex items-start gap-4">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <CheckCircle className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Booking Confirmed</p>
                          <p className="text-sm text-gray-600">Quote has been converted to booking</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quote.status === 'draft' && canManageQuote && (
                <Button 
                  className="w-full" 
                  onClick={handleSendToClient}
                  disabled={isUpdating}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Client
                </Button>
              )}
              
              {quote.status === 'approved' && (
                <Button asChild className="w-full">
                  <Link to={`/bookings/create?quote=${quote.id}`}>
                    <Plane className="h-4 w-4 mr-2" />
                    Create Booking
                  </Link>
                </Button>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link to={`/quotes/${quote.id}/preview`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Client Preview
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              
              {quote.client_email && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`mailto:${quote.client_email}?subject=Quote ${quote.quote_number}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quote Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quote Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-gray-600">{new Date(quote.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              {quote.valid_until && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Valid Until</p>
                    <p className="text-gray-600">{new Date(quote.valid_until).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Quote ID</p>
                  <p className="text-gray-600 font-mono">{quote.id.slice(0, 8)}...</p>
                </div>
              </div>

              {quote.client_portal_token && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Client Portal</p>
                  <p className="text-xs text-blue-700 mb-2">Share this link with your client:</p>
                  <div className="bg-white p-2 rounded border text-xs font-mono break-all">
                    {window.location.origin}/client/quote/{quote.client_portal_token}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailPage;