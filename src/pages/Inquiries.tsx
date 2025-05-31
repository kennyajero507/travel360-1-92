import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getInquiriesByTourType } from "../services/inquiryService";
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
  const [domesticInquiries, setDomesticInquiries] = useState([]);
  const [internationalInquiries, setInternationalInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("domestic");

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const [domesticData, internationalData] = await Promise.all([
          getInquiriesByTourType('domestic'),
          getInquiriesByTourType('international')
        ]);
        
        console.log("Fetched domestic inquiries:", domesticData);
        console.log("Fetched international inquiries:", internationalData);
        
        setDomesticInquiries(domesticData || []);
        setInternationalInquiries(internationalData || []);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
        toast.error("Failed to load inquiries");
        setDomesticInquiries([]);
        setInternationalInquiries([]);
      } finally {
        setLoading(false);
      }
    };

    if (canAccessInquiries) {
      fetchInquiries();
    }
  }, [canAccessInquiries]);

  // Filter inquiries based on user role
  const filterUserInquiries = (inquiries: any[]) => {
    if (!Array.isArray(inquiries)) {
      return [];
    }

    const userInquiries = inquiries.filter(inquiry => {
      // For agents, only show inquiries that are assigned to them
      if (role === 'agent') {
        return inquiry.assigned_to === currentUser?.id;
      }
      // Otherwise show all inquiries if admin/owner/tour operator
      return true;
    });
    
    return userInquiries.filter(inquiry => {
      const matchesFilter = filter === "all" || inquiry.status?.toLowerCase() === filter.toLowerCase();
      const matchesSearch = inquiry.client_name?.toLowerCase().includes(search.toLowerCase()) ||
                           inquiry.destination?.toLowerCase().includes(search.toLowerCase()) ||
                           inquiry.enquiry_number?.toLowerCase().includes(search.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  };

  const filteredDomesticInquiries = filterUserInquiries(domesticInquiries);
  const filteredInternationalInquiries = filterUserInquiries(internationalInquiries);

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
    
    // Update the inquiries in both arrays
    const updateInquiries = (inquiries: any[]) => 
      inquiries.map(inquiry => {
        if (inquiry.id === selectedInquiry) {
          return {
            ...inquiry,
            status: "Assigned",
            assigned_to: agent?.id || "",
            assigned_agent_name: agent?.name || ""
          };
        }
        return inquiry;
      });

    setDomesticInquiries(prev => updateInquiries(prev));
    setInternationalInquiries(prev => updateInquiries(prev));

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

  if (!canAccessInquiries) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading inquiries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">{getPageTitle()}</h1>
          <p className="text-gray-500 mt-2">Manage all your travel inquiries in one place</p>
        </div>
        <Button asChild className="self-start">
          <Link to="/inquiries/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Inquiry
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="domestic">
            Domestic Tours ({filteredDomesticInquiries.length})
          </TabsTrigger>
          <TabsTrigger value="international">
            International Tours ({filteredInternationalInquiries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="domestic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Domestic Tour Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <InquiryFilters 
                filter={filter} 
                setFilter={setFilter} 
                search={search} 
                setSearch={setSearch} 
              />

              <InquiryTable 
                filteredInquiries={filteredDomesticInquiries}
                openAssignDialog={openAssignDialog}
                permissions={permissions}
                role={role}
                currentUser={currentUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="international" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>International Tour Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <InquiryFilters 
                filter={filter} 
                setFilter={setFilter} 
                search={search} 
                setSearch={setSearch} 
              />

              <InquiryTable 
                filteredInquiries={filteredInternationalInquiries}
                openAssignDialog={openAssignDialog}
                permissions={permissions}
                role={role}
                currentUser={currentUser}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
