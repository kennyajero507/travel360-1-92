
import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, FileText, Trash2, User } from 'lucide-react';
import InquiryToQuoteConverter from './InquiryToQuoteConverter';
import { Badge } from '../ui/badge';

interface InquiryActionsProps {
  inquiry: any;
  onView: (inquiry: any) => void;
  onEdit: (inquiry: any) => void;
  onDelete: (inquiryId: string) => void;
  onAssignAgent: (inquiry: any) => void;
  onConvertToQuote: (quoteData: any) => Promise<void>;
  isConverting?: boolean;
}

const InquiryActions: React.FC<InquiryActionsProps> = ({
  inquiry,
  onView,
  onEdit,
  onDelete,
  onAssignAgent,
  onConvertToQuote,
  isConverting = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={getStatusColor(inquiry.status)}>
        {inquiry.status.replace('_', ' ')}
      </Badge>
      
      <InquiryToQuoteConverter
        inquiry={inquiry}
        onConvert={onConvertToQuote}
        isConverting={isConverting}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(inquiry)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(inquiry)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Inquiry
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAssignAgent(inquiry)}>
            <User className="mr-2 h-4 w-4" />
            Assign Agent
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(inquiry.id)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default InquiryActions;
