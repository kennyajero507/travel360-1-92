import React from "react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MoreHorizontal, Star, StarOff, Eye, Edit, DoorOpen } from "lucide-react";

interface Hotel {
  id: string;
  name: string;
  destination: string;
  category: string;
  status?: 'Active' | 'Inactive';
  room_types?: any[];
  additional_details?: {
    hasNegotiatedRate?: boolean;
  };
}

interface HotelTableProps {
  hotels: Hotel[];
  permissions: {
    canEditHotels: boolean;
  };
  onToggleStatus: (hotelId: string) => void;
}

const HotelTable: React.FC<HotelTableProps> = ({ 
  hotels = [], // Default to empty array
  permissions, 
  onToggleStatus 
}) => {
  const getMinRatePerNight = (roomTypes: any[]) => {
    if (!Array.isArray(roomTypes) || roomTypes.length === 0) return 0;
    
    try {
      const rates = roomTypes
        .map(rt => {
          // Handle different possible property names
          return rt?.ratePerNight || rt?.rate_per_night || rt?.baseRate || 0;
        })
        .filter(rate => typeof rate === 'number' && rate > 0);
      
      return rates.length > 0 ? Math.min(...rates) : 0;
    } catch (error) {
      console.warn('Error calculating min rate:', error);
      return 0;
    }
  };

  // Safety check for hotels array
  if (!Array.isArray(hotels)) {
    return (
      <div className="border rounded-md p-4 text-center text-gray-500">
        <p>No hotel data available</p>
      </div>
    );
  }

  return (
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
          {hotels.map((hotel) => (
            <TableRow key={hotel.id}>
              <TableCell className="font-medium">{hotel.id || 'N/A'}</TableCell>
              <TableCell>{hotel.name || 'Unknown Name'}</TableCell>
              <TableCell>{hotel.destination || 'Unknown Location'}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {hotel.category || 'Unknown Category'}
                  {hotel.category?.includes("5") && <Star className="ml-1 h-3.5 w-3.5 text-yellow-500" />}
                </div>
              </TableCell>
              <TableCell>
                ${getMinRatePerNight(hotel.room_types || []).toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={
                    hotel.additional_details?.hasNegotiatedRate 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  {hotel.additional_details?.hasNegotiatedRate ? "Negotiated" : "Standard"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={
                    hotel.status === "Active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {hotel.status || "Active"}
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
                    <DropdownMenuItem asChild>
                      <Link to={`/hotels/${hotel.id}`} className="flex items-center w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to={`/hotels/${hotel.id}/rooms`} className="flex items-center w-full">
                        <DoorOpen className="mr-2 h-4 w-4" />
                        Manage Rooms
                      </Link>
                    </DropdownMenuItem>
                    
                    {permissions.canEditHotels && (
                      <DropdownMenuItem asChild>
                        <Link to={`/hotels/${hotel.id}/edit`} className="flex items-center w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Hotel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {permissions.canEditHotels && (
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => onToggleStatus(hotel.id)}
                      >
                        <div className="flex items-center w-full">
                          <StarOff className="mr-2 h-4 w-4" />
                          {hotel.status === "Active" ? "Mark as Inactive" : "Mark as Active"}
                        </div>
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
  );
};

export default HotelTable;
