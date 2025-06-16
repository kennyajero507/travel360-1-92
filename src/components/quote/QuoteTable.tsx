
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { QuoteData } from '../../types/quote.types';
import { Edit, Trash2, Eye, Mail, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMultiCurrency } from '../../hooks/useMultiCurrency';
import { ConvertToBookingButton } from './ConvertToBookingButton';
import QuoteActionButtons from './QuoteActionButtons';

interface QuoteTableProps {
  quotes: QuoteData[];
  onDelete: (id: string) => void;
  onEmail?: (quote: QuoteData) => void;
  onDownload?: (quote: QuoteData) => void;
  onPreview?: (quote: QuoteData) => void;
}

export const QuoteTable: React.FC<QuoteTableProps> = ({
  quotes,
  onDelete,
  onEmail,
  onDownload,
  onPreview
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const QuoteRow = ({ quote }: { quote: QuoteData }) => {
    const { convertedQuoteTotals, formatAmount } = useMultiCurrency(quote, 'KES');
    
    return (
      <TableRow key={quote.id}>
        <TableCell className="font-medium">{quote.client}</TableCell>
        <TableCell>{quote.destination}</TableCell>
        <TableCell>
          <div className="text-sm">
            <div>{new Date(quote.start_date).toLocaleDateString()}</div>
            <div className="text-gray-500">to {new Date(quote.end_date).toLocaleDateString()}</div>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            <div>{quote.duration_nights} nights</div>
            <div className="text-gray-500">{quote.duration_days} days</div>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            {quote.adults} adults
            {quote.children_with_bed > 0 && <div>{quote.children_with_bed} children</div>}
          </div>
        </TableCell>
        <TableCell>
          <Badge className={getStatusColor(quote.status)}>
            {quote.status}
          </Badge>
        </TableCell>
        <TableCell className="font-medium">
          {convertedQuoteTotals ? formatAmount(convertedQuoteTotals.grandTotal) : 'N/A'}
        </TableCell>
        <TableCell>
          <QuoteActionButtons
            quote={quote}
            onEdit={() => navigate(`/quotes/${quote.id}`)}
            onPreview={() => onPreview?.(quote)}
            onEmail={() => onEmail?.(quote)}
            onDownload={() => onDownload?.(quote)}
            showConvertToBooking={true}
            viewMode="agent"
          />
        </TableCell>
      </TableRow>
    );
  };

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No quotes found. Create your first quote to get started.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Travel Dates</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Travelers</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total (KES)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <QuoteRow key={quote.id} quote={quote} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
