import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { FileText, Eye, Plus } from 'lucide-react';
import { useQuotes } from '../../hooks/useQuotes';
import { formatCurrency } from '../../utils/quoteCalculations';
import type { Quote } from '../../types/quote';

interface InquiryQuotesListProps {
  inquiryId: string;
}

const InquiryQuotesList: React.FC<InquiryQuotesListProps> = ({ inquiryId }) => {
  const { getQuotesByInquiry } = useQuotes();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, [inquiryId]);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await getQuotesByInquiry(inquiryId);
      setQuotes(data);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Related Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Related Quotes</CardTitle>
          <Button size="sm" asChild>
            <Link to={`/quotes/create?inquiry=${inquiryId}`}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-4">No quotes created yet</p>
            <Button size="sm" asChild>
              <Link to={`/quotes/create?inquiry=${inquiryId}`}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Quote
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <div key={quote.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {quote.quote_number || `Q-${quote.id.slice(0, 8)}`}
                    </span>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(quote.total_amount || 0, quote.currency_code || 'USD')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created {new Date(quote.created_at).toLocaleDateString()}
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/quotes/${quote.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InquiryQuotesList;