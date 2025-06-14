
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../../components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { agentService } from "../../services/agentService";
import { Loader2 } from "lucide-react";

interface Agent {
  id: string;
  name: string;
}

interface AgentAssignmentDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  selectedInquiry: string | null;
  handleAssignInquiry: () => void;
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
}

export const AgentAssignmentDialog = ({ 
  dialogOpen, 
  setDialogOpen, 
  selectedInquiry,
  handleAssignInquiry,
  selectedAgent,
  setSelectedAgent
}: AgentAssignmentDialogProps) => {
  const { profile } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAgents = async () => {
      if (!dialogOpen || !profile?.org_id) return;

      try {
        setLoading(true);
        const agentData = await agentService.getAgents(profile.org_id);
        setAgents(agentData.map(agent => ({
          id: agent.id,
          name: agent.name
        })));
      } catch (error) {
        console.error('Error loading agents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [dialogOpen, profile?.org_id]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Assign Inquiry to Agent</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">
            Select Agent
          </label>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading agents...
            </div>
          ) : (
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-full bg-white text-black">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignInquiry} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!selectedAgent || loading}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
