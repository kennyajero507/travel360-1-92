
import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, Download, Send, BookOpen } from 'lucide-react';
import { QuoteData } from '../../types/quote.types';
import { ConvertToBookingButton } from './ConvertToBookingButton';

interface QuoteActionsProps {
  quote: QuoteData;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onSend: (id: string) => void;
}

export const QuoteActions: React.FC<QuoteActionsProps> = ({
  quote,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onSend,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Direct Convert to Booking Button for approved quotes */}
      {quote.status === 'approved' && quote.approved_hotel_id && (
        <ConvertToBookingButton quote={quote} variant="outline" size="sm" />
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(quote.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(quote.id)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Quote
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDownload(quote.id)}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSend(quote.id)}>
            <Send className="h-4 w-4 mr-2" />
            Send to Client
          </DropdownMenuItem>
          {quote.status !== 'converted' && quote.approved_hotel_id && (
            <DropdownMenuItem asChild>
              <div className="w-full">
                <ConvertToBookingButton quote={quote} variant="outline" size="sm" />
              </div>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => onDelete(quote.id)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
