
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { agentService } from "../services/agentService";
import { InquiryFilters } from "../components/inquiry/InquiryFilters";
import { InquiryTable } from "../components/inquiry/InquiryTable";
import { AgentAssignmentDialog } from "../components/inquiry/AgentAssignmentDialog";
import { useInquiries, useAssignInquiry } from "../hooks/useInquiryData";
import { InquiryData } from "../types/inquiry.types";

const Inquiries = () => {
  const navigate = useNavigate();
  const { profile, checkRoleAccess } = useAuth();
  
  const canAccessInquiries = checkRoleAccess(['system_admin', 'org_owner', 'tour_operator', 'agent']);
  
  const { data: allInquiries = [], isLoading, isRefetching, refetch } = useInquiries();
  const assignInquiryMutation = useAssignInquiry();
  
  useEffect(() => {
    if (!isLoading && !canAccessInquiries) {
      toast.error("You don't have permission to access inquiries");
      navigate("/");
    }
  }, [canAccessInquiries, navigate, isLoading]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("domestic");
  const [agents, setAgents] = useState<any[]>([]);

  // Load agents for assignment
  useEffect(() => {
    const loadAgents = async () => {
      if (!profile?.org_id || profile.role === 'agent') {
        return; // Agents can't assign to others
      }

      try {
        const agentData = await agentService.getAgents(profile.org_id);
        setAgents(agentData);
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    };

    if (profile?.org_id) {
      loadAgents();
    }
  }, [profile?.org_id, profile?.role]);
  
  // Filter inquiries based on current filter, search, and tab
  const filterInquiries = (inquiries: InquiryData[], tourType: 'domestic' | 'international') => {
    if (!Array.isArray(inquiries)) {
      return [];
    }

    return inquiries.filter(inquiry => {
      const matchesTourType = inquiry.tour_type === tourType;
      const matchesFilter = filter === "all" || inquiry.status?.toLowerCase() === filter.toLowerCase();
      const matchesSearch = inquiry.client_name?.toLowerCase().includes(search.toLowerCase()) ||
                           inquiry.destination?.toLowerCase().includes(search.toLowerCase()) ||
                           inquiry.enquiry_number?.toLowerCase().includes(search.toLowerCase());
      
      return matchesTourType && matchesFilter && matchesSearch;
    });
  };

  const filteredDomesticInquiries = filterInquiries(allInquiries, 'domestic');
  const filteredInternationalInquiries = filterInquiries(allInquiries, 'international');

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

    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) {
      toast.error("Selected agent not found");
      return;
    }
    
    assignInquiryMutation.mutate(
      { inquiryId: selectedInquiry, agentId: agent.id, agentName: agent.name },
      {
        onSuccess: () => {
          setDialogOpen(false);
        }
      }
    );
  };

  const handleRefresh = () => {
    refetch();
  };
  
  // Get title based on role
  const getPageTitle = () => {
    switch(profile?.role) {
      case 'system_admin': return 'All System Inquiries';
      case 'org_owner': return 'Organization Inquiries';
      case 'tour_operator': return 'Tour Assignment';
      case 'agent': return 'My Inquiries Dashboard';
      default: return 'Inquiries';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading inquiries...</span>
      </div>
    );
  }
  
  if (!canAccessInquiries) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">{getPageTitle()}</h1>
          <p className="text-gray-500 mt-2">Manage all your travel inquiries in one place</p>
          {profile?.org_id && (
            <p className="text-sm text-gray-400">Organization: {profile.org_id}</p>
          )}
          {!profile?.org_id && profile?.role !== 'system_admin' && (
            <p className="text-sm text-amber-600">⚠️ No organization assigned - some features may be limited</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefetching}
            className="self-start"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
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
                permissions={{ canAssign: profile?.role !== 'agent' }}
                role={profile?.role || ''}
                currentUser={profile}
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
                permissions={{ canAssign: profile?.role !== 'agent' }}
                role={profile?.role || ''}
                currentUser={profile}
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
        agents={agents}
        isAssigning={assignInquiryMutation.isPending}
      />
    </div>
  );
};

export default Inquiries;
