
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
import { Hotel } from "../../types/hotel.types";
import { MoreHorizontal, Star, StarOff, Eye, Edit } from "lucide-react";
import { toast } from "sonner";

interface HotelTableProps {
  hotels: Hotel[];
  permissions: {
    canEditHotels: boolean;
  };
  onToggleStatus: (hotelId: string) => void;
}

const HotelTable: React.FC<HotelTableProps> = ({ hotels, permissions, onToggleStatus }) => {
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
              <TableCell className="font-medium">{hotel.id}</TableCell>
              <TableCell>{hotel.name}</TableCell>
              <TableCell>{hotel.destination}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {hotel.category}
                  {hotel.category?.includes("5") && <Star className="ml-1 h-3.5 w-3.5 text-yellow-500" />}
                </div>
              </TableCell>
              <TableCell>
                ${hotel.roomTypes && hotel.roomTypes.length > 0 
                  ? Math.min(...hotel.roomTypes.map(rt => rt.ratePerNight)).toFixed(2) 
                  : "0.00"}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={hotel.additionalDetails?.hasNegotiatedRate ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                  {hotel.additionalDetails?.hasNegotiatedRate ? "Negotiated" : "Standard"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={(hotel as any).status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {(hotel as any).status || "Active"}
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
                    
                    {/* Only show edit option if user has edit permissions */}
                    {permissions.canEditHotels && (
                      <DropdownMenuItem asChild>
                        <Link to={`/hotels/${hotel.id}/edit`} className="flex items-center w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Hotel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {/* Only show status change option for users with appropriate permissions */}
                    {permissions.canEditHotels && (
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => onToggleStatus(hotel.id)}
                      >
                        <div className="flex items-center w-full">
                          <StarOff className="mr-2 h-4 w-4" />
                          {(hotel as any).status === "Active" ? "Mark as Inactive" : "Mark as Active"}
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
