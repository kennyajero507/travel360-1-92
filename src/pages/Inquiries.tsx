
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getInquiriesByTourType, assignInquiryToAgent } from "../services/inquiryService";
import { agentService } from "../services/agentService";
import { InquiryFilters } from "../components/inquiry/InquiryFilters";
import { InquiryTable } from "../components/inquiry/InquiryTable";
import { AgentAssignmentDialog } from "../components/inquiry/AgentAssignmentDialog";

const Inquiries = () => {
  const navigate = useNavigate();
  const { userProfile, checkRoleAccess } = useAuth();
  
  // Allow agents to access inquiries as well
  const canAccessInquiries = checkRoleAccess(['system_admin', 'org_owner', 'tour_operator', 'agent']);
  
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
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("domestic");
  const [agents, setAgents] = useState<any[]>([]);

  // Load agents for assignment
  useEffect(() => {
    const loadAgents = async () => {
      if (!userProfile?.org_id || userProfile.role === 'agent') {
        return; // Agents can't assign to others
      }

      try {
        const agentData = await agentService.getAgents(userProfile.org_id);
        setAgents(agentData);
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    };

    loadAgents();
  }, [userProfile?.org_id, userProfile?.role]);

  const fetchInquiries = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log("Fetching inquiries for user role:", userProfile?.role);
      
      const [domesticData, internationalData] = await Promise.all([
        getInquiriesByTourType('domestic'),
        getInquiriesByTourType('international')
      ]);
      
      console.log("Fetched domestic inquiries:", domesticData?.length || 0);
      console.log("Fetched international inquiries:", internationalData?.length || 0);
      
      setDomesticInquiries(domesticData || []);
      setInternationalInquiries(internationalData || []);
      
      if (showRefreshToast) {
        toast.success("Inquiries refreshed successfully");
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      
      // Handle specific RLS errors
      if (error instanceof Error && error.message.includes('row-level security')) {
        toast.error("You don't have permission to view inquiries. Please ensure you belong to an organization.");
      } else {
        toast.error("Failed to load inquiries");
      }
      
      setDomesticInquiries([]);
      setInternationalInquiries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (canAccessInquiries && userProfile?.org_id) {
      fetchInquiries();
    }
  }, [canAccessInquiries, userProfile?.org_id]);

  // Filter inquiries based on current filter and search
  const filterInquiries = (inquiries: any[]) => {
    if (!Array.isArray(inquiries)) {
      return [];
    }

    return inquiries.filter(inquiry => {
      const matchesFilter = filter === "all" || inquiry.status?.toLowerCase() === filter.toLowerCase();
      const matchesSearch = inquiry.client_name?.toLowerCase().includes(search.toLowerCase()) ||
                           inquiry.destination?.toLowerCase().includes(search.toLowerCase()) ||
                           inquiry.enquiry_number?.toLowerCase().includes(search.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  };

  const filteredDomesticInquiries = filterInquiries(domesticInquiries);
  const filteredInternationalInquiries = filterInquiries(internationalInquiries);

  const openAssignDialog = (inquiryId: string) => {
    setSelectedInquiry(inquiryId);
    setSelectedAgent("");
    setDialogOpen(true);
  };

  const handleAssignInquiry = async () => {
    if (!selectedInquiry || !selectedAgent) {
      toast.error("Please select an agent");
      return;
    }

    try {
      // Find the selected agent
      const agent = agents.find(a => a.id === selectedAgent);
      if (!agent) {
        toast.error("Selected agent not found");
        return;
      }

      // Call the actual assignment function
      await assignInquiryToAgent(selectedInquiry, agent.id, agent.name);
      
      // Refresh the inquiries list
      await fetchInquiries();
      
      setDialogOpen(false);
    } catch (error) {
      console.error("Error assigning inquiry:", error);
      // Error is already handled by the service
    }
  };

  const handleRefresh = () => {
    fetchInquiries(true);
  };
  
  // Get title based on role
  const getPageTitle = () => {
    switch(userProfile?.role) {
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="self-start"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="self-start">
            <Link to="/inquiries/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Inquiry
            </Link>
          </Button>
        </div>
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
                permissions={{ canAssign: userProfile?.role !== 'agent' }}
                role={userProfile?.role || ''}
                currentUser={userProfile}
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
                permissions={{ canAssign: userProfile?.role !== 'agent' }}
                role={userProfile?.role || ''}
                currentUser={userProfile}
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
