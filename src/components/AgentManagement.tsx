
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Users, User, MoreHorizontal, UserPlus } from "lucide-react";
import { useRole } from "../contexts/RoleContext";

// Mock data for agents
const mockAgents = [
  { 
    id: "A001", 
    name: "John Doe", 
    email: "john@example.com", 
    status: "Active", 
    quotesCreated: 32,
    lastActive: "2024-04-25",
    assignedQuotes: ["Q-2023-001", "Q-2023-005", "Q-2023-010"]
  },
  { 
    id: "A002", 
    name: "Sarah Smith", 
    email: "sarah@example.com", 
    status: "Active", 
    quotesCreated: 18,
    lastActive: "2024-04-28",
    assignedQuotes: ["Q-2023-002", "Q-2023-007"]
  },
  { 
    id: "A003", 
    name: "Michael Brown", 
    email: "michael@example.com", 
    status: "Inactive", 
    quotesCreated: 7,
    lastActive: "2024-03-15",
    assignedQuotes: []
  },
  { 
    id: "A004", 
    name: "Emily Johnson", 
    email: "emily@example.com", 
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
    // In a real app, this would open a modal to add a new agent
    toast.info("Add agent functionality would open a form");
  };

  // Determine if the current user can manage agents based on role and tier
  const canManageAgents = role === 'system_admin' || 
                         role === 'org_owner' || 
                         (role === 'tour_operator' && (tier === 'pro' || tier === 'enterprise'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">Agent Management</h2>
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
          <CardTitle>Your Agents</CardTitle>
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

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Quotes Created</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Quotes</TableHead>
                  {canManageAgents && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.id}</TableCell>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentManagement;
