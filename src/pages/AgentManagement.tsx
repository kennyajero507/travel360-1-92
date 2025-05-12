
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { UserCheck, Plus, Edit, Trash2 } from "lucide-react";

// Mock agents data
const mockAgents = [
  { 
    id: "agent-1", 
    name: "James Smith", 
    email: "james@example.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    assignedInquiries: 5,
    completedQuotes: 12 
  },
  { 
    id: "agent-2", 
    name: "Sarah Johnson", 
    email: "sarah@example.com",
    phone: "+1 (555) 234-5678",
    status: "Active",
    assignedInquiries: 3,
    completedQuotes: 8 
  },
  { 
    id: "agent-3", 
    name: "Robert Lee", 
    email: "robert@example.com",
    phone: "+1 (555) 345-6789",
    status: "Inactive",
    assignedInquiries: 0,
    completedQuotes: 15 
  },
  { 
    id: "agent-4", 
    name: "Emma Wilson", 
    email: "emma@example.com",
    phone: "+1 (555) 456-7890",
    status: "Active",
    assignedInquiries: 7,
    completedQuotes: 9 
  }
];

const AgentManagement = () => {
  const { role, tier, permissions, currentUser } = useRole();
  const navigate = useNavigate();
  
  const [agents, setAgents] = useState(mockAgents);
  const [isAddAgentDialogOpen, setIsAddAgentDialogOpen] = useState(false);
  const [isEditAgentDialogOpen, setIsEditAgentDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active"
  });
  
  useEffect(() => {
    // Check if user has permission to manage agents
    if (!permissions.canManageAgents) {
      toast.error("You don't have permission to manage agents. This feature requires appropriate role and subscription tier.");
      navigate("/settings");
    }
  }, [permissions, navigate]);

  // Generate appropriate title based on role
  const getRoleTitle = () => {
    switch(role) {
      case 'system_admin': return 'Manage All Agents';
      case 'org_owner': return 'Manage Organization Agents';
      case 'tour_operator': return 'Manage Team Agents';
      default: return 'Agent Management';
    }
  };

  // Generate subtitle based on role and tier
  const getSubtitle = () => {
    if (role === 'system_admin') return 'System-wide agent management';
    if (role === 'org_owner') return `Organization owner - ${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription`;
    if (role === 'tour_operator') return `Tour operator - ${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription`;
    return '';
  };

  // Calculate the agent limit based on tier
  const getAgentLimit = () => {
    if (role === 'system_admin') return Infinity;
    
    switch(tier) {
      case 'basic': return 3;
      case 'pro': return 10;
      case 'enterprise': return 50;
      default: return 3;
    }
  };

  const agentLimit = getAgentLimit();
  const canAddMoreAgents = agents.length < agentLimit;

  // Handle adding a new agent
  const handleAddAgent = () => {
    if (!canAddMoreAgents) {
      toast.error(`You've reached your limit of ${agentLimit} agents. Upgrade your subscription to add more agents.`);
      return;
    }
    
    if (!newAgent.name || !newAgent.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const newAgentId = `agent-${agents.length + 1}`;
    
    const newAgentData = {
      id: newAgentId,
      name: newAgent.name,
      email: newAgent.email,
      phone: newAgent.phone,
      status: newAgent.status,
      assignedInquiries: 0,
      completedQuotes: 0
    };
    
    setAgents([...agents, newAgentData]);
    setNewAgent({
      name: "",
      email: "",
      phone: "",
      status: "Active"
    });
    setIsAddAgentDialogOpen(false);
    toast.success(`Agent ${newAgent.name} added successfully`);
  };

  // Handle editing an agent
  const handleEditAgent = () => {
    if (!selectedAgent) return;
    
    setAgents(agents.map(agent => 
      agent.id === selectedAgent.id ? selectedAgent : agent
    ));
    
    setIsEditAgentDialogOpen(false);
    toast.success(`Agent ${selectedAgent.name} updated successfully`);
  };

  // Handle deleting an agent
  const handleDeleteAgent = (agentId: string) => {
    const agentToDelete = agents.find(agent => agent.id === agentId);
    if (!agentToDelete) return;
    
    if (agentToDelete.assignedInquiries > 0) {
      toast.error(`Cannot delete ${agentToDelete.name} because they have assigned inquiries`);
      return;
    }
    
    setAgents(agents.filter(agent => agent.id !== agentId));
    toast.success(`Agent ${agentToDelete.name} deleted successfully`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">{getRoleTitle()}</h1>
        <p className="text-gray-500 mt-2">{getSubtitle()}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Agents</CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{agents.length}</span> of <span className="font-medium">{agentLimit === Infinity ? '∞' : agentLimit}</span> agents
            </div>
            <Button onClick={() => setIsAddAgentDialogOpen(true)} disabled={!canAddMoreAgents} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Assigned Inquiries</TableHead>
                  <TableHead className="text-center">Completed Quotes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell>
                      <Badge variant={agent.status === 'Active' ? 'outline' : 'secondary'} className={
                        agent.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }>
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{agent.assignedInquiries}</TableCell>
                    <TableCell className="text-center">{agent.completedQuotes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedAgent(agent);
                          setIsEditAgentDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={agent.assignedInquiries > 0}
                          onClick={() => handleDeleteAgent(agent.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {agents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No agents added yet. Click "Add Agent" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {tier !== 'enterprise' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <h3 className="text-md font-medium text-blue-700">Need to manage more agents?</h3>
              <p className="text-sm text-blue-600">
                Upgrade to {tier === 'basic' ? 'Pro' : 'Enterprise'} to get {tier === 'basic' ? '10' : '50'} agent accounts and access to advanced features.
              </p>
              <Button className="mt-2 bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/settings/subscription")}>
                Upgrade Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Agent Dialog */}
      <Dialog open={isAddAgentDialogOpen} onOpenChange={setIsAddAgentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              Add a new agent to your team. They will receive an email invitation to set up their account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                id="name"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                placeholder="Agent's full name"
                required
                className="bg-white text-black"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newAgent.email}
                onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                placeholder="agent@company.com"
                required
                className="bg-white text-black"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone
              </label>
              <Input
                id="phone"
                value={newAgent.phone}
                onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                placeholder="Phone number"
                className="bg-white text-black"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2">
                Status
              </label>
              <Select 
                value={newAgent.status} 
                onValueChange={(value) => setNewAgent({ ...newAgent, status: value })}
              >
                <SelectTrigger id="status" className="bg-white text-black">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAgentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAgent} className="bg-blue-600 hover:bg-blue-700">
              <UserCheck className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditAgentDialogOpen} onOpenChange={setIsEditAgentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update the agent's information.
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  id="edit-name"
                  value={selectedAgent.name}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, name: e.target.value })}
                  placeholder="Agent's full name"
                  required
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedAgent.email}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, email: e.target.value })}
                  placeholder="agent@company.com"
                  required
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="edit-phone" className="block text-sm font-medium mb-2">
                  Phone
                </label>
                <Input
                  id="edit-phone"
                  value={selectedAgent.phone}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, phone: e.target.value })}
                  placeholder="Phone number"
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium mb-2">
                  Status
                </label>
                <Select 
                  value={selectedAgent.status} 
                  onValueChange={(value) => setSelectedAgent({ ...selectedAgent, status: value })}
                >
                  <SelectTrigger id="edit-status" className="bg-white text-black">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAgentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAgent} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentManagement;
