
import { Link, useNavigate } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { FileText, MoreHorizontal, MessageSquare, UserCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteInquiry } from "../../services/inquiryService";
import { useAuth } from "../../contexts/AuthContext";

interface InquiryActionsProps {
  inquiry: any;
  openAssignDialog: (inquiryId: string) => void;
  permissions: any;
  role: string;
  currentUserId: string;
  onDelete?: () => void;
}

export const InquiryActions = ({ 
  inquiry, 
  openAssignDialog, 
  permissions, 
  role, 
  currentUserId,
  onDelete
}: InquiryActionsProps) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const handleCreateQuote = () => {
    if (!inquiry.id) {
      toast.error("Inquiry ID is required to create a quote");
      return;
    }
    
    // Navigate to create quote page with inquiry ID as query parameter
    navigate(`/quotes/create?inquiryId=${inquiry.id}`);
  };
  
  const handleDeleteInquiry = async () => {
    if (!inquiry.id) {
      toast.error("Inquiry ID is required to delete");
      return;
    }
    
    try {
      if (window.confirm("Are you sure you want to delete this inquiry?")) {
        await deleteInquiry(inquiry.id);
        toast.success("Inquiry deleted successfully");
        if (onDelete) onDelete();
        // Refresh the page to update the list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      toast.error("Failed to delete inquiry");
    }
  };
  
  // Check if user can modify this inquiry based on role
  const canModify = () => {
    if (!userProfile) return false;
    
    // System admins can modify anything
    if (userProfile.role === 'system_admin') return true;
    
    // Organization owners and tour operators can modify anything within their org
    if (['org_owner', 'tour_operator'].includes(userProfile.role)) return true;
    
    // Agents can only modify their assigned inquiries
    if (userProfile.role === 'agent') {
      return inquiry.assigned_to === currentUserId;
    }
    
    return false;
  };
  
  // Check if user can create quote based on role and assignment
  const canCreateQuote = () => {
    if (!userProfile) return false;
    
    // System admins can create quotes for any inquiry
    if (userProfile.role === 'system_admin') return true;
    
    // Organization owners and tour operators can create quotes for any inquiry in their org
    if (['org_owner', 'tour_operator'].includes(userProfile.role)) return true;
    
    // Agents can only create quotes for inquiries assigned to them
    if (userProfile.role === 'agent') {
      return inquiry.assigned_to === currentUserId;
    }
    
    return false;
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
        
        {canModify() && (
          <DropdownMenuItem asChild>
            <Link 
              to={`/inquiries/edit/${inquiry.id}`} 
              className="flex items-center w-full cursor-pointer"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Edit Inquiry
            </Link>
          </DropdownMenuItem>
        )}
        
        {/* Show create quote based on role and assignment */}
        {canCreateQuote() && (
          <DropdownMenuItem onClick={handleCreateQuote} className="flex items-center w-full cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            Create Quote
          </DropdownMenuItem>
        )}
        
        {/* Only tour operators and above can assign inquiries */}
        {userProfile && ['system_admin', 'org_owner', 'tour_operator'].includes(userProfile.role) && (
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
        
        {/* Only system admins, org owners and tour operators can delete inquiries */}
        {userProfile && ['system_admin', 'org_owner', 'tour_operator'].includes(userProfile.role) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteInquiry}
              className="flex items-center w-full cursor-pointer text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Inquiry
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
