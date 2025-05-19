
import { useState } from "react";
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

// Mock agents data
const mockAgents = [
  { id: "agent-1", name: "James Smith" },
  { id: "agent-2", name: "Sarah Johnson" },
  { id: "agent-3", name: "Robert Lee" },
  { id: "agent-4", name: "Emma Wilson" },
  { id: "agent-5", name: "Brooklyn Simmons" },
];

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
              {mockAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignInquiry} className="bg-blue-600 hover:bg-blue-700">
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
