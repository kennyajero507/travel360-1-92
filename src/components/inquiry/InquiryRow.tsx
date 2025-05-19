
import { TableCell, TableRow } from "../../components/ui/table";
import { InquiryStatusBadge, PriorityBadge } from "./InquiryStatusBadge";
import { InquiryActions } from "./InquiryActions";
import { Phone } from "lucide-react";

interface InquiryRowProps {
  inquiry: any;
  openAssignDialog: (inquiryId: string) => void;
  permissions: any;
  role: string;
  currentUser: any;
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

export const InquiryRow = ({ inquiry, openAssignDialog, permissions, role, currentUser }: InquiryRowProps) => {
  return (
    <TableRow key={inquiry.id}>
      <TableCell className="font-medium">{inquiry.id}</TableCell>
      <TableCell>{inquiry.client}</TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center">
          <Phone className="mr-1 h-3 w-3" />
          {inquiry.mobile}
        </div>
      </TableCell>
      <TableCell>{inquiry.destination}</TableCell>
      <TableCell>
        {inquiry.start_date && inquiry.end_date ? 
          `${new Date(inquiry.start_date).toLocaleDateString()} - ${new Date(inquiry.end_date).toLocaleDateString()}` :
          "Not specified"
        }
      </TableCell>
      <TableCell>
        {formatTravelers(inquiry)}
      </TableCell>
      <TableCell>{inquiry.num_rooms || 1} {inquiry.room_type || 'Room'}</TableCell>
      <TableCell>{inquiry.budget ? `$${inquiry.budget}` : 'Not specified'}</TableCell>
      <TableCell>
        <InquiryStatusBadge status={inquiry.status || 'New'} />
      </TableCell>
      <TableCell>
        <PriorityBadge priority={inquiry.priority || 'Normal'} />
      </TableCell>
      <TableCell>
        {inquiry.assigned_agent_name || "-"}
      </TableCell>
      <TableCell className="text-right">
        <InquiryActions 
          inquiry={inquiry} 
          openAssignDialog={openAssignDialog}
          permissions={permissions}
          role={role}
          currentUserId={currentUser?.id}
        />
      </TableCell>
    </TableRow>
  );
};
