
import React from 'react';
import { Button } from '../ui/button';
import { Send, BookOpen, Download, Mail } from 'lucide-react';
import { QuoteData } from '../../types/quote.types';
import QuotePreviewButton from './QuotePreviewButton';

interface QuoteActionsProps {
  quote: QuoteData;
  onProceedToBooking: () => void;
  onSendToClient: () => void;
  onDownload: () => void;
  onEmail: () => void;
  isLoading?: boolean;
}

const QuoteActions: React.FC<QuoteActionsProps> = ({
  quote,
  onProceedToBooking,
  onSendToClient,
  onDownload,
  onEmail,
  isLoading = false
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <QuotePreviewButton quote={quote} />
      
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
        disabled={isLoading || !quote.id}
      >
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onEmail}
        disabled={isLoading || !quote.id}
      >
        <Mail className="h-4 w-4 mr-2" />
        Email Quote
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={onSendToClient}
        disabled={isLoading || !quote.id}
      >
        <Send className="h-4 w-4 mr-2" />
        Send to Client
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onProceedToBooking}
        disabled={isLoading || !quote.id}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Proceed to Booking
      </Button>
    </div>
  );
};

export default QuoteActions;
