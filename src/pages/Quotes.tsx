
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { FileText, Plus, MoreHorizontal, Download, Eye, Edit } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

const mockQuotes = [
  {
    id: "Q-2023-001",
    client: "Sarah Johnson",
    destination: "Zanzibar",
    dates: "Aug 20-27, 2024",
    travelers: 2,
    total: "$4,850",
    status: "Approved",
  },
  {
    id: "Q-2023-002",
    client: "Michael Chen",
    destination: "Nairobi & Maasai Mara",
    dates: "Sept 5-15, 2024",
    travelers: 4,
    total: "$12,350",
    status: "Pending",
  },
  {
    id: "Q-2023-003",
    client: "Emily Rodriguez",
    destination: "Serengeti",
    dates: "Oct 10-18, 2024",
    travelers: 2,
    total: "$7,200",
    status: "Draft",
  },
  {
    id: "Q-2023-004",
    client: "David Kim",
    destination: "Cape Town",
    dates: "Nov 22-29, 2024",
    travelers: 3,
    total: "$6,800",
    status: "Pending",
  },
  {
    id: "Q-2023-005",
    client: "Maria Garcia",
    destination: "Morocco",
    dates: "Dec 15-26, 2024",
    travelers: 2,
    total: "$5,400",
    status: "Approved",
  },
];

const Quotes = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredQuotes = mockQuotes.filter(quote => {
    const matchesFilter = filter === "all" || quote.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = quote.client.toLowerCase().includes(search.toLowerCase()) ||
                          quote.destination.toLowerCase().includes(search.toLowerCase()) ||
                          quote.id.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };
  
  const handleViewQuote = (id: string) => {
    // Store quote data in session storage for preview
    const quote = mockQuotes.find(q => q.id === id);
    if (quote) {
      sessionStorage.setItem('previewQuote', JSON.stringify({
        id: quote.id,
        client: quote.client,
        destination: quote.destination,
        dates: quote.dates,
        travelers: quote.travelers,
        total: quote.total,
        status: quote.status,
      }));
      window.open('/quote-preview', '_blank');
    } else {
      toast.error("Quote not found");
    }
  };
  
  const handleEditQuote = (id: string) => {
    toast.info(`Editing quote ${id}`);
    navigate(`/quotes/edit/${id}`);
  };
  
  const handleDownloadQuote = (id: string) => {
    // Store quote data in session storage for download
    const quote = mockQuotes.find(q => q.id === id);
    if (quote) {
      sessionStorage.setItem('downloadQuote', JSON.stringify({
        id: quote.id,
        client: quote.client,
        destination: quote.destination,
        dates: quote.dates,
        travelers: quote.travelers,
        total: quote.total,
        status: quote.status,
      }));
      
      // Generate PDF content
      const pdfContent = `
        <html>
          <head>
            <title>Quote ${quote.id}</title>
            <style>
              body { font-family: 'Jost', sans-serif; margin: 20px; }
              h1 { color: #2563eb; }
              .header { display: flex; justify-content: space-between; align-items: center; }
              .quote-details { margin-top: 20px; border: 1px solid #ddd; padding: 15px; }
              .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; text-align: right; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>TravelFlow Quote</h1>
              <p>Quote #: ${quote.id}</p>
            </div>
            <div class="quote-details">
              <p><strong>Client:</strong> ${quote.client}</p>
              <p><strong>Destination:</strong> ${quote.destination}</p>
              <p><strong>Dates:</strong> ${quote.dates}</p>
              <p><strong>Travelers:</strong> ${quote.travelers}</p>
              <p><strong>Status:</strong> ${quote.status}</p>
              <div class="total">Total: ${quote.total}</div>
            </div>
          </body>
        </html>
      `;
      
      // Create a Blob with the PDF content
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quote-${quote.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded quote ${id}`);
    } else {
      toast.error("Quote not found");
    }
  };
  
  const handleEmailQuote = (id: string) => {
    // In a real app, this would send an email with the quote
    toast.success(`Quote ${id} sent via email`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-gray-500 mt-2">Manage all your travel quotes in one place</p>
        </div>
        <Button asChild className="self-start">
          <Link to="/quotes/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Quote
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-64">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quotes</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search quotes..."
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
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Travelers</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>{quote.client}</TableCell>
                    <TableCell>{quote.destination}</TableCell>
                    <TableCell>{quote.dates}</TableCell>
                    <TableCell>{quote.travelers}</TableCell>
                    <TableCell>{quote.total}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewQuote(quote.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        
                        <Button
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditQuote(quote.id)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white text-black">
                            <DropdownMenuItem onClick={() => handleDownloadQuote(quote.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download as PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmailQuote(quote.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                              </svg>
                              Email to Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

export default Quotes;
