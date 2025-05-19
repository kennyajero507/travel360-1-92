
import { Link } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { FileText, MoreHorizontal, MessageSquare, UserCheck } from "lucide-react";

interface InquiryActionsProps {
  inquiry: any;
  openAssignDialog: (inquiryId: string) => void;
  permissions: any;
  role: string;
  currentUserId: string;
}

export const InquiryActions = ({ inquiry, openAssignDialog, permissions, role, currentUserId }: InquiryActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/inquiries/${inquiry.id}`} className="flex items-center w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            View Inquiry
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/inquiries/${inquiry.id}/edit`} className="flex items-center w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Edit Inquiry
          </Link>
        </DropdownMenuItem>
        {/* Only show create quote option if inquiry is assigned to the current agent or if user is admin/operator */}
        {(role !== 'agent' || inquiry.assigned_to === currentUserId) && (
          <DropdownMenuItem asChild>
            <Link to={`/quotes/create/${inquiry.id}`} className="flex items-center w-full">
              <FileText className="mr-2 h-4 w-4" />
              Create Quote
            </Link>
          </DropdownMenuItem>
        )}
        {permissions.canAssignInquiries && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openAssignDialog(inquiry.id)} className="flex items-center w-full">
              <UserCheck className="mr-2 h-4 w-4" />
              Assign to Agent
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
