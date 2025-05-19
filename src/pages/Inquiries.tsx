import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";
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
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { FileText, Plus, MoreHorizontal, MessageSquare, UserCheck, Phone, User } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { getAllInquiries } from "../services/inquiryService";

// Mock agents data
const mockAgents = [
  { id: "agent-1", name: "James Smith" },
  { id: "agent-2", name: "Sarah Johnson" },
  { id: "agent-3", name: "Robert Lee" },
  { id: "agent-4", name: "Emma Wilson" },
  { id: "agent-5", name: "Brooklyn Simmons" },
];

const Inquiries = () => {
  const navigate = useNavigate();
  const { role, permissions, currentUser } = useRole();
  
  // Allow agents to access inquiries as well
  const canAccessInquiries = role === 'org_owner' || role === 'tour_operator' || role === 'system_admin' || role === 'agent';
  
  // Redirect if user doesn't have permission
  useEffect(() => {
    if (!canAccessInquiries) {
      toast.error("You don't have permission to access inquiries");
      navigate("/");
    }
  }, [canAccessInquiries, navigate]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const data = await getAllInquiries();
        console.log("Fetched inquiries:", data);
        setInquiries(data);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
        toast.error("Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  // Filter inquiries based on user role
  const userInquiries = inquiries.filter(inquiry => {
    // For agents, only show inquiries that are ALREADY assigned to them or that they created
    // (not showing unassigned inquiries that they could claim)
    if (role === 'agent') {
      return inquiry.assigned_to === currentUser.id;
    }
    // Otherwise show all inquiries if admin/owner/tour operator
    return true;
  });
  
  const filteredInquiries = userInquiries.filter(inquiry => {
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
          assigned_to: agent?.id || "",
          assigned_agent_name: agent?.name || ""
        };
      }
      return inquiry;
    }));

    toast.success(`Inquiry ${selectedInquiry} assigned to ${agent?.name}`);
    setDialogOpen(false);
  };
  
  // Get title based on role
  const getPageTitle = () => {
    switch(role) {
      case 'system_admin': return 'All System Inquiries';
      case 'org_owner': return 'Organization Inquiries';
      case 'tour_operator': return 'Tour Assignment';
      case 'agent': return 'My Inquiries Dashboard';
      default: return 'Inquiries';
    }
  };

  // Format travelers information
  const formatTravelers = (inquiry) => {
    let result = `${inquiry.adults || 0} A`;
    if (inquiry.children && inquiry.children > 0) {
      result += `, ${inquiry.children} C`;
    }
    if (inquiry.infants && inquiry.infants > 0) {
      result += `, ${inquiry.infants} I`;
    }
    return result;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">{getPageTitle()}</h1>
          <p className="text-gray-500 mt-2">Manage all your travel inquiries in one place</p>
        </div>
        {/* Allow agents to create inquiries as well */}
        <Button asChild className="self-start">
          <Link to="/inquiries/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Inquiry
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle>
            {role === 'agent' ? 
              `Inquiries Assigned to ${currentUser.name}` : 
              'All Inquiries'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-64">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-white text-black">
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
                className="w-full bg-white text-black"
              />
            </div>
          </div>

          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Travelers</TableHead>
                  <TableHead>Rooms</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.id}</TableCell>
                      <TableCell>{inquiry.client}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {inquiry.mobile}
                        </div>
                      </TableCell>
                      <TableCell>{inquiry.destination}</TableCell>
                      <TableCell>
                        {inquiry.start_date && inquiry.end_date ? 
                          `${new Date(inquiry.start_date).toLocaleDateString()} - ${new Date(inquiry.end_date).toLocaleDateString()}` :
                          "Not specified"
                        }
                      </TableCell>
                      <TableCell>
                        {formatTravelers(inquiry)}
                      </TableCell>
                      <TableCell>{inquiry.num_rooms || 1} {inquiry.room_type || 'Room'}</TableCell>
                      <TableCell>{inquiry.budget ? `$${inquiry.budget}` : 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(inquiry.status || 'New')}>
                          {inquiry.status || 'New'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(inquiry.priority || 'Normal')}>
                          {inquiry.priority || 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inquiry.assigned_agent_name || "-"}
                      </TableCell>
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
                            {/* Only show create quote option if inquiry is assigned to the current agent or if user is admin/operator */}
                            {(role !== 'agent' || inquiry.assigned_to === currentUser.id) && (
                              <DropdownMenuItem asChild>
                                <Link to={`/quotes/create/${inquiry.id}`} className="flex items-center w-full">
                                  <FileText className="mr-2 h-4 w-4" />
                                  Create Quote
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {permissions.canAssignInquiries && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openAssignDialog(inquiry.id)} className="flex items-center w-full">
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Assign to Agent
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-10">
                      {role === 'agent' ? 
                        "No inquiries assigned to you yet." : 
                        "No inquiries found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default Inquiries;
