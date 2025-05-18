
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { getAllQuotes } from "../services/quoteService";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { 
  AlertCircle, 
  Check, 
  Download, 
  Eye, 
  Filter, 
  Mail, 
  MoreHorizontal, 
  PenLine, 
  Plus, 
  Printer, 
  Search,
  X 
} from "lucide-react";
import { toast } from "sonner";

// Status badge color mapping
const statusColorMap = {
  draft: "bg-gray-200 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

// Status icons
const statusIconMap = {
  draft: <PenLine className="mr-1 h-3 w-3 text-gray-600" />,
  sent: <Mail className="mr-1 h-3 w-3 text-blue-600" />,
  approved: <Check className="mr-1 h-3 w-3 text-green-600" />,
  rejected: <X className="mr-1 h-3 w-3 text-red-600" />,
};

// Mock data (to be replaced by API data)
const mockQuoteData = [
  {
    id: "Q-2024-001",
    client: "John Smith",
    destination: "Zanzibar",
    dateRange: "Aug 20, 2024 - Aug 27, 2024",
    amount: 3500,
    status: "sent",
    createdAt: "2024-05-10T10:30:00Z",
  },
  {
    id: "Q-2024-002",
    client: "Emily Wilson",
    destination: "Serengeti Safari",
    dateRange: "Sep 10, 2024 - Sep 20, 2024",
    amount: 12800,
    status: "approved",
    createdAt: "2024-05-08T14:15:00Z",
  },
  {
    id: "Q-2024-003",
    client: "Michael Johnson",
    destination: "Kilimanjaro Trek",
    dateRange: "Oct 5, 2024 - Oct 15, 2024",
    amount: 5200,
    status: "draft",
    createdAt: "2024-05-12T09:45:00Z",
  },
  {
    id: "Q-2024-004",
    client: "Sarah Lee",
    destination: "Ngorongoro Crater",
    dateRange: "Nov 18, 2024 - Nov 25, 2024",
    amount: 4800,
    status: "rejected",
    createdAt: "2024-05-07T16:20:00Z",
  },
  {
    id: "Q-2024-005",
    client: "Robert Davis",
    destination: "Mombasa Beach",
    dateRange: "Dec 10, 2024 - Dec 20, 2024",
    amount: 2900,
    status: "sent",
    createdAt: "2024-05-14T11:10:00Z",
  },
];

const Quotes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch quotes data
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await getAllQuotes();
        setQuotes(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quotes:", error);
        toast.error("Failed to load quotes");
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  // Function to handle quote actions
  const handleQuoteAction = (action, quoteId) => {
    switch (action) {
      case "view":
        navigate(`/quotes/${quoteId}`);
        break;
      case "edit":
        navigate(`/quotes/edit/${quoteId}`);
        break;
      case "print":
        toast.info(`Printing quote ${quoteId}...`);
        // Implement print functionality
        window.open(`/quote-preview?id=${quoteId}`, '_blank');
        break;
      case "email":
        toast.success(`Quote ${quoteId} sent to client via email`);
        // Implement email functionality
        break;
      case "download":
        toast.success(`Quote ${quoteId} downloaded`);
        // Implement download functionality
        break;
      case "delete":
        toast.error(`Quote ${quoteId} deleted`);
        // Implement delete functionality
        break;
      default:
        break;
    }
  };

  // Filter quotes based on search term and status filter
  const filteredQuotes = mockQuoteData.filter((quote) => {
    const matchesSearch = quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       quote.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       quote.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Quotes</h1>
          <p className="text-gray-500 mt-2">
            Manage and track all your tour package quotes
          </p>
        </div>
        <Link to="/quotes/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Quote
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Quote Management</CardTitle>
          <CardDescription>
            View, filter and manage all your tour quotes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Label htmlFor="status-filter" className="sr-only">
                Filter by status
              </Label>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status-filter" className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Destination</TableHead>
                  <TableHead className="hidden md:table-cell">Date Range</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No quotes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.id}</TableCell>
                      <TableCell>{quote.client}</TableCell>
                      <TableCell className="hidden md:table-cell">{quote.destination}</TableCell>
                      <TableCell className="hidden md:table-cell">{quote.dateRange}</TableCell>
                      <TableCell>${quote.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={statusColorMap[quote.status]}
                        >
                          {statusIconMap[quote.status]}
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleQuoteAction("view", quote.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuoteAction("edit", quote.id)}>
                              <PenLine className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleQuoteAction("print", quote.id)}>
                              <Printer className="mr-2 h-4 w-4" />
                              <span>Print</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuoteAction("email", quote.id)}>
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Email to Client</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuoteAction("download", quote.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Download PDF</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleQuoteAction("delete", quote.id)}
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quotes;
