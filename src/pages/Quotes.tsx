
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
import { useRole } from "../contexts/RoleContext";

// Sample complete quote data for preview
const mockQuoteData = {
  id: "Q-2023-001",
  client: "Sarah Johnson",
  mobile: "+1 (555) 123-4567",
  destination: "Zanzibar",
  startDate: "2024-08-20",
  endDate: "2024-08-27",
  duration: {
    days: 8,
    nights: 7
  },
  travelers: {
    adults: 2,
    children: 0,
    infants: 0
  },
  hotels: [
    {
      id: "hotel-1",
      name: "Serena Beach Resort",
      roomType: "Deluxe Ocean View",
      ratePerNight: 250,
      rooms: 1,
      nights: 7,
      total: 1750
    }
  ],
  transports: [
    {
      id: "transport-1",
      type: "Airport Transfer",
      description: "Round-trip airport transfers",
      cost: 100
    }
  ],
  subtotal: 1850,
  markup: {
    type: "percentage",
    value: 15,
    amount: 277.50
  },
  grandTotal: 2127.50,
  notes: "Includes daily breakfast",
  status: "Approved"
};

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
  const { currentUser, role } = useRole();

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
    // Store a complete quote object that includes all fields needed for preview
    // In a real app, this data would come from the database
    // Here we're using mockQuoteData for demonstration
    const quoteForPreview = { ...mockQuoteData, id };
    
    // Store in session storage for preview
    try {
      sessionStorage.setItem('previewQuote', JSON.stringify(quoteForPreview));
      console.log("Quote preview data stored:", quoteForPreview);
      
      // Open in a new tab to avoid navigation issues
      window.open('/quote-preview', '_blank');
    } catch (error) {
      console.error("Error storing quote data:", error);
      toast.error("Could not prepare quote for preview");
    }
  };
  
  const handleEditQuote = (id: string) => {
    toast.info(`Editing quote ${id}`);
    navigate(`/quotes/edit/${id}`);
  };
  
  const handleDownloadQuote = (id: string) => {
    // Store quote data for download
    const quoteForDownload = { ...mockQuoteData, id };
    
    try {
      // Generate PDF content
      const pdfContent = `
        <html>
          <head>
            <title>Quote ${id}</title>
            <style>
              body { font-family: 'Jost', sans-serif; margin: 20px; }
              h1 { color: #2563eb; }
              .header { display: flex; justify-content: space-between; align-items: center; }
              .quote-details { margin-top: 20px; border: 1px solid #ddd; padding: 15px; }
              .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; text-align: right; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>TravelFlow Quote</h1>
              <p>Quote #: ${id}</p>
            </div>
            <div class="quote-details">
              <p><strong>Client:</strong> ${mockQuoteData.client}</p>
              <p><strong>Destination:</strong> ${mockQuoteData.destination}</p>
              <p><strong>Dates:</strong> ${new Date(mockQuoteData.startDate).toLocaleDateString()} - ${new Date(mockQuoteData.endDate).toLocaleDateString()}</p>
              <p><strong>Travelers:</strong> ${mockQuoteData.travelers.adults} Adults</p>
              
              <h3>Accommodations</h3>
              <table>
                <tr>
                  <th>Hotel</th>
                  <th>Room</th>
                  <th>Nights</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
                ${mockQuoteData.hotels.map(hotel => `
                  <tr>
                    <td>${hotel.name}</td>
                    <td>${hotel.roomType}</td>
                    <td>${hotel.nights}</td>
                    <td>$${hotel.ratePerNight}</td>
                    <td>$${hotel.total}</td>
                  </tr>
                `).join('')}
              </table>
              
              <h3>Transportation</h3>
              <table>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Cost</th>
                </tr>
                ${mockQuoteData.transports.map(transport => `
                  <tr>
                    <td>${transport.type}</td>
                    <td>${transport.description}</td>
                    <td>$${transport.cost}</td>
                  </tr>
                `).join('')}
              </table>
              
              <div class="total">
                <p>Subtotal: $${mockQuoteData.subtotal}</p>
                <p>Markup (${mockQuoteData.markup.value}%): $${mockQuoteData.markup.amount}</p>
                <p>Total: $${mockQuoteData.grandTotal}</p>
              </div>
            </div>
            <p>Generated by: ${currentUser.name}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </body>
        </html>
      `;
      
      // Create a Blob with the PDF content
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quote-${id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded quote ${id}`);
    } catch (error) {
      console.error("Error downloading quote:", error);
      toast.error("Could not download quote");
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
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Quotes</h1>
          <p className="text-gray-500 mt-2">
            {role === 'agent' ? 
              `${currentUser.name}'s Quotes` : 
              'Manage all your travel quotes in one place'}
          </p>
        </div>
        <Button asChild className="self-start bg-blue-600 hover:bg-blue-700">
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
