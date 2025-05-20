
import { Link, useNavigate } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { FileText, MoreHorizontal, MessageSquare, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface InquiryActionsProps {
  inquiry: any;
  openAssignDialog: (inquiryId: string) => void;
  permissions: any;
  role: string;
  currentUserId: string;
}

export const InquiryActions = ({ inquiry, openAssignDialog, permissions, role, currentUserId }: InquiryActionsProps) => {
  const navigate = useNavigate();
  
  const handleCreateQuote = () => {
    if (!inquiry.id) {
      toast.error("Inquiry ID is required to create a quote");
      return;
    }
    
    // Navigate to create quote page with inquiry ID
    navigate(`/quotes/create?inquiryId=${inquiry.id}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem asChild>
          <Link 
            to={`/inquiries/${inquiry.id}`} 
            className="flex items-center w-full cursor-pointer"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            View Inquiry
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link 
            to={`/inquiries/edit/${inquiry.id}`} 
            className="flex items-center w-full cursor-pointer"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Edit Inquiry
          </Link>
        </DropdownMenuItem>
        
        {/* Only show create quote option if inquiry is assigned to the current agent or if user is admin/operator */}
        {(role !== 'agent' || inquiry.assigned_to === currentUserId) && (
          <DropdownMenuItem onClick={handleCreateQuote} className="flex items-center w-full cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            Create Quote
          </DropdownMenuItem>
        )}
        
        {permissions.canAssignInquiries && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => openAssignDialog(inquiry.id)}
              className="flex items-center w-full cursor-pointer"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Assign to Agent
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
