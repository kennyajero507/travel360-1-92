
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { FileText, Plus, MoreHorizontal, MessageSquare, UserCheck } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

// Mock inquiries data
const mockInquiries = [
  {
    id: "I-2024-001",
    client: "John Smith",
    destination: "Zanzibar",
    dates: "Aug 20-27, 2024",
    travelers: 2,
    budget: "$5,000",
    status: "New",
    priority: "Normal",
    assignedTo: null,
  },
  {
    id: "I-2024-002",
    client: "Emily Wilson",
    destination: "Serengeti Safari",
    dates: "Sept 10-20, 2024",
    travelers: 4,
    budget: "$12,000",
    status: "Assigned",
    priority: "High",
    assignedTo: "Jane Cooper",
  },
  {
    id: "I-2024-003",
    client: "Michael Chang",
    destination: "Cape Town",
    dates: "Oct 5-15, 2024",
    travelers: 2,
    budget: "$6,500",
    status: "Quoted",
    priority: "Urgent",
    assignedTo: "Robert Fox",
  },
  {
    id: "I-2024-004",
    client: "Sarah Johnson",
    destination: "Morocco",
    dates: "Nov 12-22, 2024",
    travelers: 3,
    budget: "$8,000",
    status: "New",
    priority: "Normal",
    assignedTo: null,
  },
  {
    id: "I-2024-005",
    client: "Robert Davis",
    destination: "Nairobi & Maasai Mara",
    dates: "Dec 18-30, 2024",
    travelers: 6,
    budget: "$15,000",
    status: "Assigned",
    priority: "Normal",
    assignedTo: "Wade Warren",
  },
];

// Mock agents data
const mockAgents = [
  { id: "agent-1", name: "Jane Cooper" },
  { id: "agent-2", name: "Robert Fox" },
  { id: "agent-3", name: "Wade Warren" },
  { id: "agent-4", name: "Esther Howard" },
  { id: "agent-5", name: "Brooklyn Simmons" },
];

const Inquiries = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [inquiries, setInquiries] = useState(mockInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesFilter = filter === "all" || inquiry.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = inquiry.client.toLowerCase().includes(search.toLowerCase()) ||
                         inquiry.destination.toLowerCase().includes(search.toLowerCase()) ||
                         inquiry.id.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new": return "bg-blue-100 text-blue-800";
      case "assigned": return "bg-yellow-100 text-yellow-800";
      case "quoted": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-green-100 text-green-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
    
    // Update the inquiries
    setInquiries(prev => prev.map(inquiry => {
      if (inquiry.id === selectedInquiry) {
        return {
          ...inquiry,
          status: "Assigned",
          assignedTo: agent?.name || ""
        };
      }
      return inquiry;
    }));

    toast.success(`Inquiry ${selectedInquiry} assigned to ${agent?.name}`);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inquiries</h1>
          <p className="text-gray-500 mt-2">Manage all your travel inquiries in one place</p>
        </div>
        <Button asChild className="self-start">
          <Link to="/inquiries/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Inquiry
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-64">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Inquiries</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search inquiries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Travelers</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.id}</TableCell>
                    <TableCell>{inquiry.client}</TableCell>
                    <TableCell>{inquiry.destination}</TableCell>
                    <TableCell>{inquiry.dates}</TableCell>
                    <TableCell>{inquiry.travelers}</TableCell>
                    <TableCell>{inquiry.budget}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(inquiry.priority)}>
                        {inquiry.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{inquiry.assignedTo || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/inquiries/${inquiry.id}`} className="flex items-center w-full">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              View Inquiry
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/inquiries/${inquiry.id}/edit`} className="flex items-center w-full">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Edit Inquiry
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/quotes/create/${inquiry.id}`} className="flex items-center w-full">
                              <FileText className="mr-2 h-4 w-4" />
                              Create Quote
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openAssignDialog(inquiry.id)} className="flex items-center w-full">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Assign to Agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Inquiry to Agent</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Select Agent
            </label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-full">
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
            <Button onClick={handleAssignInquiry}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inquiries;
