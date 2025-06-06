
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
import { getAllQuotes, deleteQuote, emailQuote, printQuote, downloadQuotePDF } from "../services/quoteService";
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
  X,
  ClipboardList,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

const Quotes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch quotes using React Query
  const { data: quotes = [], isLoading, error } = useQuery({
    queryKey: ['quotes'],
    queryFn: getAllQuotes,
  });

  // Function to handle quote actions
  const handleQuoteAction = async (action: string, quoteId: string) => {
    try {
      switch (action) {
        case "view":
          navigate(`/quotes/${quoteId}`);
          break;
        case "edit":
          navigate(`/quotes/edit/${quoteId}`);
          break;
        case "create-booking":
          navigate(`/quotes/${quoteId}/create-booking`);
          break;
        case "print":
          await printQuote(quoteId);
          break;
        case "email":
          await emailQuote(quoteId);
          break;
        case "download":
          await downloadQuotePDF(quoteId);
          break;
        case "delete":
          await deleteQuote(quoteId);
          // Refresh quotes after deletion
          queryClient.invalidateQueries({ queryKey: ['quotes'] });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error handling quote action:", error);
      toast.error("Failed to perform action");
    }
  };

  // Filter quotes based on search term and status filter
  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch = quote.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       quote.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       quote.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const canCreateBooking = userProfile && 
    ['agent', 'tour_operator', 'org_owner'].includes(userProfile.role);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600">Quotes</h1>
            <p className="text-gray-500 mt-2">
              Manage and track all your tour package quotes
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Quotes</h2>
            <p className="text-gray-600 mb-4">There was an error loading your quotes. Please try again.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['quotes'] })}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading quotes...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Destination</TableHead>
                    <TableHead className="hidden md:table-cell">Date Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {quotes.length === 0 ? "No quotes found. Create your first quote!" : "No quotes match your search criteria."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.id}</TableCell>
                        <TableCell>{quote.client}</TableCell>
                        <TableCell className="hidden md:table-cell">{quote.destination}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {quote.start_date && quote.end_date 
                            ? `${format(new Date(quote.start_date), 'MMM dd, yyyy')} - ${format(new Date(quote.end_date), 'MMM dd, yyyy')}`
                            : 'Not set'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={statusColorMap[quote.status] || statusColorMap.draft}
                          >
                            {statusIconMap[quote.status] || statusIconMap.draft}
                            {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1) || 'Draft'}
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
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleQuoteAction("view", quote.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuoteAction("edit", quote.id)}>
                                <PenLine className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              {quote.status === "approved" && canCreateBooking && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleQuoteAction("create-booking", quote.id)}>
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    <span>Create Booking</span>
                                  </DropdownMenuItem>
                                </>
                              )}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Quotes;
