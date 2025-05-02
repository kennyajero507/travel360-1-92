
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
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { FileText, Plus, MoreHorizontal, MessageSquare } from "lucide-react";
import { Badge } from "../components/ui/badge";

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
  },
];

const Inquiries = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredInquiries = mockInquiries.filter(inquiry => {
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link to={`/inquiries/${inquiry.id}`} className="flex items-center w-full">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              View Inquiry
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link to={`/inquiries/${inquiry.id}/edit`} className="flex items-center w-full">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Edit Inquiry
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link to={`/quotes/create/${inquiry.id}`} className="flex items-center w-full">
                              <FileText className="mr-2 h-4 w-4" />
                              Create Quote
                            </Link>
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
    </div>
  );
};

export default Inquiries;
