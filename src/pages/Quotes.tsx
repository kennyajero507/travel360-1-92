
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { Badge } from "../components/ui/badge";
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Send, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { useQuoteData } from "../hooks/useQuoteData";
import { useRole } from "../contexts/RoleContext";
import { PageLoading, ErrorState, EmptyState } from "../components/common/LoadingStates";

const Quotes = () => {
  const { role, permissions } = useRole();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  const {
    quotes,
    isLoading,
    error,
    deleteQuote,
    emailQuote,
    printQuote,
    downloadQuotePDF
  } = useQuoteData();

  // Filter quotes based on search and filter
  const filteredQuotes = quotes.filter(quote => {
    const matchesFilter = filter === "all" || quote.status === filter;
    const matchesSearch = quote.client?.toLowerCase().includes(search.toLowerCase()) ||
                         quote.destination?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteQuote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await deleteQuote(id);
        toast.success('Quote deleted successfully');
      } catch (error) {
        console.error('Delete quote error:', error);
      }
    }
  };

  const handleEmailQuote = async (id: string) => {
    try {
      await emailQuote(id);
    } catch (error) {
      console.error('Email quote error:', error);
    }
  };

  const handlePrintQuote = async (id: string) => {
    try {
      await printQuote(id);
    } catch (error) {
      console.error('Print quote error:', error);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      await downloadQuotePDF(id);
    } catch (error) {
      console.error('Download PDF error:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'No dates';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endFormatted = end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  if (isLoading) {
    return <PageLoading message="Loading quotes..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-teal-600">Quotes</h1>
            <p className="text-gray-500">Manage your quotes</p>
          </div>
        </div>
        <ErrorState 
          title="Failed to load quotes"
          message="There was an error loading your quotes. Please try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-teal-600">Quotes</h1>
          <p className="text-gray-500">
            {role === 'agent' 
              ? 'View and manage your quotes' 
              : 'Manage all quotes for your organization'
            }
          </p>
        </div>
        
        {permissions.canCreateQuotes && (
          <Button 
            onClick={() => navigate('/quotes/create')}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Quote
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by client name or destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="filter">Filter by Status</Label>
              <select
                id="filter"
                className="w-full p-2 border rounded-md"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Quotes</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Quotes Table or Empty State */}
          {filteredQuotes.length === 0 ? (
            <EmptyState
              title={search || filter !== "all" 
                ? "No quotes match your search criteria" 
                : "No quotes created yet"
              }
              message={search || filter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Create your first quote to get started"
              }
              action={permissions.canCreateQuotes && (!search && filter === "all") ? (
                <Button onClick={() => navigate('/quotes/create')}>
                  Create First Quote
                </Button>
              ) : undefined}
            />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Travel Dates</TableHead>
                    <TableHead>Travelers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.id}</TableCell>
                      <TableCell>{quote.client}</TableCell>
                      <TableCell>{quote.destination}</TableCell>
                      <TableCell>{formatDateRange(quote.start_date, quote.end_date)}</TableCell>
                      <TableCell>
                        {quote.adults} Adults
                        {quote.children_with_bed > 0 && `, ${quote.children_with_bed} Children`}
                        {quote.infants > 0 && `, ${quote.infants} Infants`}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(quote.status)}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {quote.created_at ? new Date(quote.created_at).toLocaleDateString() : 'Unknown'}
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
                            <DropdownMenuItem
                              onClick={() => navigate(`/quotes/${quote.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => navigate(`/quotes/${quote.id}/preview`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            
                            {permissions.canEditQuotes && (
                              <DropdownMenuItem
                                onClick={() => navigate(`/quotes/edit/${quote.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Quote
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem
                              onClick={() => handleEmailQuote(quote.id)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send to Client
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => handleDownloadPDF(quote.id)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            
                            {permissions.canDeleteQuotes && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteQuote(quote.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Quote
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
