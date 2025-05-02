
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
import { FileText, Plus, MoreHorizontal, Download } from "lucide-react";
import { Badge } from "../components/ui/badge";

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
                <SelectTrigger>
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
                className="w-full"
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link to={`/quotes/${quote.id}`} className="flex items-center w-full">
                              <FileText className="mr-2 h-4 w-4" />
                              View Quote
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link to={`/quotes/${quote.id}/edit`} className="flex items-center w-full">
                              <FileText className="mr-2 h-4 w-4" />
                              Edit Quote
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <div className="flex items-center w-full">
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </div>
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

export default Quotes;
