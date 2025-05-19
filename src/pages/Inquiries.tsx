import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getAllInquiries } from "../services/inquiryService";
import { InquiryFilters } from "../components/inquiry/InquiryFilters";
import { InquiryTable } from "../components/inquiry/InquiryTable";
import { AgentAssignmentDialog } from "../components/inquiry/AgentAssignmentDialog";

// Mock agents data for the agent assignment dialog
const mockAgents = [
  { id: "agent-1", name: "James Smith" },
  { id: "agent-2", name: "Sarah Johnson" },
  { id: "agent-3", name: "Robert Lee" },
  { id: "agent-4", name: "Emma Wilson" },
  { id: "agent-5", name: "Brooklyn Simmons" },
];

const Inquiries = () => {
  const navigate = useNavigate();
  const { role, permissions, currentUser } = useRole();
  
  // Allow agents to access inquiries as well
  const canAccessInquiries = role === 'org_owner' || role === 'tour_operator' || role === 'system_admin' || role === 'agent';
  
  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!canAccessInquiries) {
      toast.error("You don't have permission to access inquiries");
      navigate("/");
    }
  }, [canAccessInquiries, navigate]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const data = await getAllInquiries();
        console.log("Fetched inquiries:", data);
        setInquiries(data);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
        toast.error("Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  // Filter inquiries based on user role
  const userInquiries = inquiries.filter(inquiry => {
    // For agents, only show inquiries that are ALREADY assigned to them or that they created
    // (not showing unassigned inquiries that they could claim)
    if (role === 'agent') {
      return inquiry.assigned_to === currentUser.id;
    }
    // Otherwise show all inquiries if admin/owner/tour operator
    return true;
  });
  
  const filteredInquiries = userInquiries.filter(inquiry => {
    const matchesFilter = filter === "all" || inquiry.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = inquiry.client.toLowerCase().includes(search.toLowerCase()) ||
                         inquiry.destination.toLowerCase().includes(search.toLowerCase()) ||
                         inquiry.id.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const openAssignDialog = (inquiryId: string) => {
    setSelectedInquiry(inquiryId);
    setSelectedAgent("");
    setDialogOpen(true);
  };

  const handleAssignInquiry = () => {
    if (!selectedInquiry || !selectedAgent) {
      toast.error("Please select an agent");
      return;
    }

    // Find the selected agent
    const agent = mockAgents.find(a => a.id === selectedAgent);
    
    // Update the inquiries
    setInquiries(prev => prev.map(inquiry => {
      if (inquiry.id === selectedInquiry) {
        return {
          ...inquiry,
          status: "Assigned",
          assigned_to: agent?.id || "",
          assigned_agent_name: agent?.name || ""
        };
      }
      return inquiry;
    }));

    toast.success(`Inquiry ${selectedInquiry} assigned to ${agent?.name}`);
    setDialogOpen(false);
  };
  
  // Get title based on role
  const getPageTitle = () => {
    switch(role) {
      case 'system_admin': return 'All System Inquiries';
      case 'org_owner': return 'Organization Inquiries';
      case 'tour_operator': return 'Tour Assignment';
      case 'agent': return 'My Inquiries Dashboard';
      default: return 'Inquiries';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">{getPageTitle()}</h1>
          <p className="text-gray-500 mt-2">Manage all your travel inquiries in one place</p>
        </div>
        {/* Allow agents to create inquiries as well */}
        <Button asChild className="self-start">
          <Link to="/inquiries/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Inquiry
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle>
            {role === 'agent' ? 
              `Inquiries Assigned to ${currentUser.name}` : 
              'All Inquiries'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InquiryFilters 
            filter={filter} 
            setFilter={setFilter} 
            search={search} 
            setSearch={setSearch} 
          />

          <InquiryTable 
            filteredInquiries={filteredInquiries}
            openAssignDialog={openAssignDialog}
            permissions={permissions}
            role={role}
            currentUser={currentUser}
          />
        </CardContent>
      </Card>

      <AgentAssignmentDialog 
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        selectedInquiry={selectedInquiry}
        handleAssignInquiry={handleAssignInquiry}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
      />
    </div>
  );
};

export default Inquiries;
