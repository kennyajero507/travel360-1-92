import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Mail, Eye, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { useQuotes } from '../../hooks/useQuotes';
import type { Quote } from '../../types/quote';
import { toast } from 'sonner';

interface QuoteStatusManagerProps {
  quote: Quote;
  canManage?: boolean;
  onStatusUpdated?: () => void;
}

const QuoteStatusManager: React.FC<QuoteStatusManagerProps> = ({
  quote,
  canManage = true,
  onStatusUpdated
}) => {
  const { updateQuoteStatus, sendQuoteToClient, loading } = useQuotes();

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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateQuoteStatus(quote.id, newStatus);
      onStatusUpdated?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSendToClient = async () => {
    if (!quote.client_email) {
      toast.error('Client email is required to send quote');
      return;
    }

    try {
      await sendQuoteToClient(quote.id, quote.client_email);
      onStatusUpdated?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(quote.status)}
          Quote Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Status:</span>
          <Badge className={getStatusColor(quote.status)}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </Badge>
        </div>

        {isExpired && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              ⚠️ This quote expired on {new Date(quote.valid_until!).toLocaleDateString()}
            </p>
          </div>
        )}

        {quote.status === 'draft' && canManage && (
          <div className="space-y-3">
            <Button
              onClick={handleSendToClient}
              disabled={loading || !quote.client_email}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send to Client
            </Button>
            {!quote.client_email && (
              <p className="text-xs text-red-600">Client email required to send quote</p>
            )}
          </div>
        )}

        {canManage && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Update Status:</label>
            <Select value={quote.status} onValueChange={handleStatusUpdate} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {quote.sent_to_client_at && (
          <div className="text-xs text-gray-600">
            Sent to client: {new Date(quote.sent_to_client_at).toLocaleString()}
          </div>
        )}

        {quote.client_viewed_at && (
          <div className="text-xs text-gray-600">
            Last viewed: {new Date(quote.client_viewed_at).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteStatusManager;