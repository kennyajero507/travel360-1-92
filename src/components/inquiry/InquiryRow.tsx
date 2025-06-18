
import { TableCell, TableRow } from "../../components/ui/table";
import { InquiryStatusBadge, PriorityBadge } from "./InquiryStatusBadge";
import InquiryActions from "./InquiryActions";
import { Phone, Calendar, MapPin, Package } from "lucide-react";

interface InquiryRowProps {
  inquiry: any;
  onView: (inquiry: any) => void;
  onEdit: (inquiry: any) => void;
  onDelete: (inquiryId: string) => void;
  onAssignAgent: (inquiry: any) => void;
  onConvertToQuote: (quoteData: any) => Promise<void>;
  permissions: any;
  role: string;
  currentUser: any;
  isConverting?: boolean;
}

// Helper function to format travelers info
export const formatTravelers = (inquiry: any) => {
  if (!inquiry) return 'N/A';
  
  let result = `${inquiry.adults || 0} A`;
  if (inquiry.children && inquiry.children > 0) {
    result += `, ${inquiry.children} C`;
  }
  if (inquiry.infants && inquiry.infants > 0) {
    result += `, ${inquiry.infants} I`;
  }
  return result;
};

// Helper function to format duration
const formatDuration = (inquiry: any) => {
  if (inquiry.days_count && inquiry.nights_count) {
    return `${inquiry.days_count}D/${inquiry.nights_count}N`;
  }
  return 'N/A';
};

export const InquiryRow = ({ 
  inquiry, 
  onView,
  onEdit,
  onDelete,
  onAssignAgent,
  onConvertToQuote,
  permissions, 
  role, 
  currentUser,
  isConverting = false
}: InquiryRowProps) => {
  return (
    <TableRow key={inquiry.id}>
      <TableCell className="font-medium text-blue-600">
        {inquiry.enquiry_number || inquiry.id}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
            inquiry.tour_type === 'domestic' ? 'bg-green-500' : 'bg-blue-500'
          }`}></span>
          {inquiry.tour_type === 'domestic' ? 'Domestic' : 'International'}
        </div>
      </TableCell>
      <TableCell>{inquiry.client_name}</TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center">
          <Phone className="mr-1 h-3 w-3" />
          {inquiry.client_mobile}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <MapPin className="mr-1 h-3 w-3" />
          {inquiry.destination}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Package className="mr-1 h-3 w-3" />
          {inquiry.package_name || inquiry.custom_package || 'Custom'}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Calendar className="mr-1 h-3 w-3" />
          {inquiry.check_in_date && inquiry.check_out_date ? 
            `${new Date(inquiry.check_in_date).toLocaleDateString()} - ${new Date(inquiry.check_out_date).toLocaleDateString()}` :
            "Not specified"
          }
        </div>
      </TableCell>
      <TableCell className="text-center">
        {formatDuration(inquiry)}
      </TableCell>
      <TableCell>
        {formatTravelers(inquiry)}
      </TableCell>
      <TableCell>{inquiry.num_rooms || 1} Room{(inquiry.num_rooms || 1) > 1 ? 's' : ''}</TableCell>
      <TableCell>
        <InquiryStatusBadge status={inquiry.status || 'New'} />
      </TableCell>
      <TableCell>
        <PriorityBadge priority={inquiry.priority || 'Normal'} />
      </TableCell>
      <TableCell>
        {inquiry.assigned_agent_name || "-"}
      </TableCell>
      <TableCell>{inquiry.lead_source || "-"}</TableCell>
      <TableCell className="text-right">
        <InquiryActions 
          inquiry={inquiry} 
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignAgent={onAssignAgent}
          onConvertToQuote={onConvertToQuote}
          isConverting={isConverting}
        />
      </TableCell>
    </TableRow>
  );
};
