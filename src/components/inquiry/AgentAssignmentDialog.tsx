
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
  agents: Agent[];
  isAssigning: boolean;
}

export const AgentAssignmentDialog = ({ 
  dialogOpen, 
  setDialogOpen, 
  selectedInquiry,
  handleAssignInquiry,
  selectedAgent,
  setSelectedAgent,
  agents,
  isAssigning,
}: AgentAssignmentDialogProps) => {
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
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-full bg-white text-black">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.length === 0 ? (
                <div className="flex items-center justify-center py-4 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading agents...
                </div>
              ) : (
                agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignInquiry} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!selectedAgent || isAssigning}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
