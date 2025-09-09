import React, { useState } from 'react';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuotes } from '../../hooks/useQuotes';
import { formatCurrency } from '../../utils/quoteCalculations';
import QuoteCard from '../../components/quotes/QuoteCard';
import { toast } from 'sonner';
import QuoteAnalyticsDashboard from '../../components/quotes/QuoteAnalyticsDashboard';

const QuotesPage = () => {
  const { profile } = useSimpleAuth();
  const { quotes, loading, updateQuote } = useQuotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.quote_number && quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get quotes by status
  const getQuotesByStatus = (status: string) => {
    return quotes.filter(quote => quote.status === status);
  };

  // Calculate total value
  const totalValue = quotes.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);

  // Handle quote approval
  const handleApprove = async (quote: any) => {
    try {
      await updateQuote(quote.id, { status: 'approved' });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  // Handle send email
  const handleSendEmail = (quote: any) => {
    toast.info('Email functionality coming soon!');
  };

  // Handle download PDF
  const handleDownloadPDF = (quote: any) => {
    toast.info('PDF download functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-1">Manage and track your travel quotes</p>
        </div>
        <Button asChild>
          <Link to="/quotes/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Quote
          </Link>
        </Button>
      </div>

      {/* Analytics Dashboard */}
      <QuoteAnalyticsDashboard />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotes.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
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
                  {formatCurrency(totalValue, 'USD')}
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
          <QuoteCard
            key={quote.id}
            quote={quote}
            onApprove={handleApprove}
            onSendEmail={handleSendEmail}
            onDownloadPDF={handleDownloadPDF}
          />
        ))}

        {filteredQuotes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No quotes match your filters' : 'No quotes yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first quote from an inquiry.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button asChild>
                  <Link to="/quotes/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Quote
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