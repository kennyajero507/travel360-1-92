
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "../components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { Users, User, MoreHorizontal, UserPlus, Mail, Phone } from "lucide-react";
import { useRole } from "../contexts/RoleContext";

// Mock data for agents
const mockAgents = [
  { 
    id: "A001", 
    name: "John Doe", 
    email: "john@example.com", 
    phone: "+1 (555) 123-4567",
    status: "Active", 
    quotesCreated: 32,
    lastActive: "2024-04-25",
    assignedQuotes: ["Q-2023-001", "Q-2023-005", "Q-2023-010"]
  },
  { 
    id: "A002", 
    name: "Sarah Smith", 
    email: "sarah@example.com",
    phone: "+1 (555) 234-5678", 
    status: "Active", 
    quotesCreated: 18,
    lastActive: "2024-04-28",
    assignedQuotes: ["Q-2023-002", "Q-2023-007"]
  },
  { 
    id: "A003", 
    name: "Michael Brown", 
    email: "michael@example.com", 
    phone: "+1 (555) 345-6789",
    status: "Inactive", 
    quotesCreated: 7,
    lastActive: "2024-03-15",
    assignedQuotes: []
  },
  { 
    id: "A004", 
    name: "Emily Johnson", 
    email: "emily@example.com", 
    phone: "+1 (555) 456-7890",
    status: "Pending", 
    quotesCreated: 0,
    lastActive: "N/A",
    assignedQuotes: [] 
  }
];

const AgentManagement = () => {
  const [agents, setAgents] = useState(mockAgents);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Pending"
  });
  
  const { role, tier } = useRole();

  const filteredAgents = agents.filter(agent => {
    const matchesFilter = filter === "all" || agent.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = 
      agent.name.toLowerCase().includes(search.toLowerCase()) || 
      agent.email.toLowerCase().includes(search.toLowerCase()) ||
      agent.id.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleChangeStatus = (agentId: string, newStatus: string) => {
    const updatedAgents = agents.map(agent => 
      agent.id === agentId ? {...agent, status: newStatus} : agent
    );
    setAgents(updatedAgents);
    toast.success(`Agent status updated to ${newStatus}`);
  };

  const handleAddAgent = () => {
    setNewAgent({
      name: "",
      email: "",
      phone: "",
      status: "Pending"
    });
    setDialogOpen(true);
  };
  
  const handleCreateAgent = () => {
    // Validate form
    if (!newAgent.name || !newAgent.email || !newAgent.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Create new agent
    const newAgentId = `A00${agents.length + 1}`;
    const createdAgent = {
      id: newAgentId,
      name: newAgent.name,
      email: newAgent.email,
      phone: newAgent.phone,
      status: newAgent.status,
      quotesCreated: 0,
      lastActive: "N/A",
      assignedQuotes: []
    };
    
    setAgents([...agents, createdAgent]);
    toast.success(`Agent ${newAgent.name} created successfully`);
    setDialogOpen(false);
  };

  // Determine if the current user can manage agents based on role and tier
  const canManageAgents = role === 'system_admin' || 
                         role === 'org_owner' || 
                         (role === 'tour_operator' && (tier === 'pro' || tier === 'enterprise'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-600">Agent Management</h2>
          <p className="text-gray-500">
            {canManageAgents 
              ? `Manage your travel agents - ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier` 
              : "Agent information"}
          </p>
        </div>
        {canManageAgents && (
          <Button onClick={handleAddAgent} className="self-start">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Agent
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-row items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle>Agent Directory</CardTitle>
          </div>
          <CardDescription>Manage your team of travel agents and their access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {canManageAgents && (
              <div className="w-full md:w-64">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex-1">
              <Input
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white text-black"
              />
            </div>
          </div>

          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Quotes Created</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Quotes</TableHead>
                  {canManageAgents && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.length > 0 ? (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {agent.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {agent.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          {agent.phone}
                        </div>
                      </TableCell>
                      <TableCell>{agent.quotesCreated}</TableCell>
                      <TableCell>{agent.lastActive}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            agent.status === "Active" ? "bg-green-100 text-green-800" : 
                            agent.status === "Inactive" ? "bg-red-100 text-red-800" : 
                            "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {agent.assignedQuotes.length > 0 ? (
                          <span>{agent.assignedQuotes.length} quotes</span>
                        ) : (
                          <span className="text-gray-400">No quotes</span>
                        )}
                      </TableCell>
                      {canManageAgents && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info(`View details for ${agent.name}`)}>
                                <User className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {agent.status !== "Active" && (
                                <DropdownMenuItem onClick={() => handleChangeStatus(agent.id, "Active")}>
                                  <span className="text-green-600 flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    Activate
                                  </span>
                                </DropdownMenuItem>
                              )}
                              {agent.status !== "Inactive" && (
                                <DropdownMenuItem onClick={() => handleChangeStatus(agent.id, "Inactive")}>
                                  <span className="text-red-600 flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      No agents found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              Create a new agent account for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium mb-1 block">
                  Agent Name *
                </label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                  className="bg-white text-black"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-1 block">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agent@example.com"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                  className="bg-white text-black"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium mb-1 block">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={newAgent.phone}
                  onChange={(e) => setNewAgent({...newAgent, phone: e.target.value})}
                  className="bg-white text-black"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="text-sm font-medium mb-1 block">
                  Status
                </label>
                <Select 
                  value={newAgent.status} 
                  onValueChange={(value) => setNewAgent({...newAgent, status: value})}
                >
                  <SelectTrigger id="status" className="bg-white text-black">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAgent} className="bg-blue-600 hover:bg-blue-700">
              Create Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentManagement;
