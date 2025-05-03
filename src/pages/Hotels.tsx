
import { useState, useEffect } from "react";
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
import { Input } from "../components/ui/input";
import { Hotel, Plus, MoreHorizontal, Star, StarOff } from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";

// Mock hotels data
const mockHotels = [
  {
    id: "H-001",
    name: "Serena Hotel",
    location: "Nairobi, Kenya",
    category: "5-Star",
    ratePerNight: 250,
    hasNegotiatedRate: true,
    amenities: ["Pool", "Spa", "Restaurant", "WiFi"],
    status: "Active"
  },
  {
    id: "H-002",
    name: "Zanzibar Beach Resort",
    location: "Zanzibar, Tanzania",
    category: "4-Star",
    ratePerNight: 180,
    hasNegotiatedRate: true,
    amenities: ["Beach Access", "Pool", "Restaurant", "WiFi"],
    status: "Active"
  },
  {
    id: "H-003",
    name: "Cape Town Luxury Suites",
    location: "Cape Town, South Africa",
    category: "5-Star",
    ratePerNight: 320,
    hasNegotiatedRate: false,
    amenities: ["Pool", "Spa", "Gym", "Restaurant", "WiFi"],
    status: "Active"
  },
  {
    id: "H-004",
    name: "Marrakech Riad",
    location: "Marrakech, Morocco",
    category: "4-Star",
    ratePerNight: 150,
    hasNegotiatedRate: true,
    amenities: ["Pool", "Restaurant", "WiFi"],
    status: "Active"
  },
  {
    id: "H-005",
    name: "Safari Lodge",
    location: "Maasai Mara, Kenya",
    category: "4-Star",
    ratePerNight: 420,
    hasNegotiatedRate: false,
    amenities: ["Game Drives", "Restaurant", "WiFi"],
    status: "Inactive"
  },
];

const Hotels = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { role, tier, permissions } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    // Updated to check for canManageHotels instead of canAddHotels
    if (!permissions.canManageHotels) {
      toast.error("You don't have permission to manage hotels");
      navigate("/");
    }
  }, [permissions, navigate]);

  const filteredHotels = mockHotels.filter(hotel => {
    const matchesFilter = filter === "all" || 
      (filter === "negotiated" && hotel.hasNegotiatedRate) ||
      (filter === "non-negotiated" && !hotel.hasNegotiatedRate) ||
      (filter === "active" && hotel.status === "Active") ||
      (filter === "inactive" && hotel.status === "Inactive");
    
    const matchesSearch = hotel.name.toLowerCase().includes(search.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Hotels</h1>
          <p className="text-gray-500 mt-2">
            {role === 'admin' 
              ? 'Manage your hotel inventory' 
              : `${role === 'operator' ? 'Tour Operator' : 'Agent'} Hotel Inventory - ${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription`}
          </p>
        </div>
        <Button asChild className="self-start">
          <Link to="/hotels/create">
            <Plus className="mr-2 h-4 w-4" />
            Add New Hotel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-64">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Filter hotels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hotels</SelectItem>
                  <SelectItem value="negotiated">Negotiated Rates</SelectItem>
                  <SelectItem value="non-negotiated">Standard Rates</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search hotels..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rate per Night ($)</TableHead>
                  <TableHead>Rate Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">{hotel.id}</TableCell>
                    <TableCell>{hotel.name}</TableCell>
                    <TableCell>{hotel.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {hotel.category}
                        {hotel.category.includes("5") && <Star className="ml-1 h-3.5 w-3.5 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>${hotel.ratePerNight}</TableCell>
                    <TableCell>
                      {hotel.hasNegotiatedRate ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Negotiated
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Standard
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={hotel.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {hotel.status}
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
                            <Link to={`/hotels/${hotel.id}`} className="flex items-center w-full">
                              <Hotel className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link to={`/hotels/${hotel.id}/edit`} className="flex items-center w-full">
                              <Hotel className="mr-2 h-4 w-4" />
                              Edit Hotel
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <div className="flex items-center w-full">
                              <StarOff className="mr-2 h-4 w-4" />
                              {hotel.status === "Active" ? "Mark as Inactive" : "Mark as Active"}
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

export default Hotels;
