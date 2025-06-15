
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { useInquiries, useAssignInquiry } from "../hooks/useInquiryData";
import { useAuth } from "../contexts/AuthContext";
import { agentService } from "../services/agentService";
import { AvailableAgent } from "../types/inquiry.types";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { InquiryFilters } from "../components/inquiry/InquiryFilters";
import { InquiryTable } from "../components/inquiry/InquiryTable";
import { AgentAssignmentDialog } from "../components/inquiry/AgentAssignmentDialog";
import { Skeleton } from "../components/ui/skeleton";

const Inquiries = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  // FIX: Get the correct variable, not .data
  const { inquiries, isLoading, refetch } = useInquiries();
  const { mutate: assignInquiry, isPending: isAssigning } = useAssignInquiry();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState<AvailableAgent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState("");

  const role = profile?.role || 'agent';

  useEffect(() => {
    const loadAgents = async () => {
      if (profile?.org_id) {
        try {
          const fetchedAgents = await agentService.getAgents(profile.org_id);
          setAgents(fetchedAgents.map(a => ({ id: a.id, name: a.name })));
        } catch (error) {
          console.error("Failed to fetch agents", error);
        }
      }
    };
    if (!authLoading && role !== 'agent') {
      loadAgents();
    }
  }, [profile?.org_id, authLoading, role]);

  const filteredInquiries = useMemo(() => {
    let filtered = inquiries;

    if (filter !== "all") {
      filtered = filtered.filter((inquiry) => inquiry.status.toLowerCase() === filter);
    }
    
    if (role === 'agent') {
        filtered = filtered.filter(inquiry => inquiry.assigned_to === profile?.id);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(
        (inquiry) =>
          inquiry.client_name?.toLowerCase().includes(searchTerm) ||
          inquiry.destination?.toLowerCase().includes(searchTerm) ||
          inquiry.enquiry_number?.toLowerCase().includes(searchTerm) ||
          inquiry.package_name?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [inquiries, filter, search, role, profile?.id]);

  const openAssignDialog = (inquiryId: string) => {
    setSelectedInquiry(inquiryId);
    setDialogOpen(true);
  };

  const handleAssignInquiry = () => {
    if (selectedInquiry && selectedAgent) {
        const agent = agents.find(a => a.id === selectedAgent);
        if (agent) {
            assignInquiry({ inquiryId: selectedInquiry, agentId: selectedAgent, agentName: agent.name }, {
                onSuccess: () => {
                    setDialogOpen(false);
                    setSelectedInquiry(null);
                    setSelectedAgent("");
                    refetch();
                }
            });
        }
    }
  };

  const permissions = {
    inquiries: {
      can_assign: role !== 'agent',
    }
  };

  if (isLoading || authLoading) {
    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inquiries</h1>
        <Button onClick={() => navigate("/inquiries/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Inquiry
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <InquiryFilters filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} />
          <InquiryTable
            filteredInquiries={filteredInquiries}
            openAssignDialog={openAssignDialog}
            permissions={permissions}
            role={role}
            currentUser={profile}
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
        agents={agents}
        isAssigning={isAssigning}
      />
      {/* TODO: Add Approve button to quote details and enhanced booking details area as discussed */}
    </div>
  );
};

export default Inquiries;
