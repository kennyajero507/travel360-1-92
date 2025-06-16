
import React from 'react';
import { Button } from '../ui/button';
import { ConvertToBookingButton } from './ConvertToBookingButton';
import { QuoteData } from '../../types/quote.types';
import { Eye, Mail, Download, Edit } from 'lucide-react';

interface QuoteActionButtonsProps {
  quote: QuoteData;
  onPreview?: () => void;
  onEmail?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
  showConvertToBooking?: boolean;
  viewMode?: 'agent' | 'admin';
}

const QuoteActionButtons: React.FC<QuoteActionButtonsProps> = ({
  quote,
  onPreview,
  onEmail,
  onDownload,
  onEdit,
  showConvertToBooking = true,
  viewMode = 'agent'
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}
      
      {onPreview && (
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      )}
      
      {onEmail && (
        <Button variant="outline" size="sm" onClick={onEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      )}
      
      {onDownload && (
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      )}
      
      {showConvertToBooking && quote.status === 'approved' && (
        <ConvertToBookingButton 
          quote={quote} 
          size="sm"
          variant="default"
        />
      )}
    </div>
  );
};

export default QuoteActionButtons;
