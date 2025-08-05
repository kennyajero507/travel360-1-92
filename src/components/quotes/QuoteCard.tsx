import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Mail, 
  Clock, 
  Eye, 
  Edit, 
  Send, 
  Download 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Quote } from '../../types/quote';
import { formatCurrency } from '../../utils/quoteCalculations';

interface QuoteCardProps {
  quote: Quote;
  onSendEmail?: (quote: Quote) => void;
  onDownloadPDF?: (quote: Quote) => void;
  onApprove?: (quote: Quote) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onSendEmail,
  onDownloadPDF,
  onApprove
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalGuests = (quote.adults || 0) + 
                     (quote.children_with_bed || 0) + 
                     (quote.children_no_bed || 0) + 
                     (quote.infants || 0);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {quote.quote_number || `Quote-${quote.id.slice(0, 8)}`}
              </h3>
              <Badge className={getStatusColor(quote.status)}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{quote.client}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{quote.destination}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(quote.start_date).toLocaleDateString()} - {new Date(quote.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {totalGuests} guest{totalGuests !== 1 ? 's' : ''} • {quote.duration_nights} night{quote.duration_nights !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium">{formatCurrency(quote.subtotal || 0, quote.currency_code || 'USD')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Markup ({quote.markup_percentage || 0}%)</p>
                  <p className="font-medium text-blue-600">{formatCurrency(quote.markup_amount || 0, quote.currency_code || 'USD')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Price</p>
                  <p className="font-bold text-green-600">{formatCurrency(quote.total_amount || 0, quote.currency_code || 'USD')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              {quote.client_email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {quote.client_email}
                </div>
              )}
              {quote.valid_until && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Valid until {new Date(quote.valid_until).toLocaleDateString()}
                </div>
              )}
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
            
            {quote.status === 'pending' && onApprove && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onApprove(quote)}>
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
            
            {onSendEmail && (
              <Button variant="outline" size="sm" onClick={() => onSendEmail(quote)}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            )}
            
            {onDownloadPDF && (
              <Button variant="outline" size="sm" onClick={() => onDownloadPDF(quote)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;