
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Hotel, RoomType } from "../types/hotel.types";
import { Edit, ChevronLeft, Star, Building, Home } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";

const HotelDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { permissions } = useRole();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch hotel data from localStorage
    try {
      setLoading(true);
      const hotels = JSON.parse(localStorage.getItem('hotels') || '[]');
      const foundHotel = hotels.find((h: Hotel) => h.id === hotelId);
      
      if (foundHotel) {
        setHotel(foundHotel);
      } else {
        toast.error("Hotel not found");
        navigate("/hotels");
      }
    } catch (error) {
      console.error("Error loading hotel data:", error);
      toast.error("Failed to load hotel data");
    } finally {
      setLoading(false);
    }
  }, [hotelId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/hotels")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Hotels
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-xl font-semibold mb-4">Hotel not found</p>
              <Button onClick={() => navigate("/hotels")}>Return to Hotels</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/hotels")}>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Back</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600">{hotel.name}</h1>
            {hotel.category?.includes('5') && (
              <Star className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <p className="text-gray-500 mt-2">{hotel.destination}</p>
        </div>

        {permissions.canEditHotels && (
          <Button asChild>
            <Link to={`/hotels/${hotel.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Hotel
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Hotel Details
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Room Types
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Basic Details</h3>
                  <dl className="space-y-2">
                    <div className="flex flex-col">
                      <dt className="text-sm text-gray-500">Name</dt>
                      <dd>{hotel.name}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm text-gray-500">Category</dt>
                      <dd>{hotel.category}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm text-gray-500">Address</dt>
                      <dd>{hotel.address}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm text-gray-500">Destination</dt>
                      <dd>{hotel.destination}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Additional Information</h3>
                  <dl className="space-y-2">
                    {hotel.additionalDetails?.website && (
                      <div className="flex flex-col">
                        <dt className="text-sm text-gray-500">Website</dt>
                        <dd>
                          <a href={hotel.additionalDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {hotel.additionalDetails.website}
                          </a>
                        </dd>
                      </div>
                    )}
                    {hotel.additionalDetails?.contactPerson && (
                      <div className="flex flex-col">
                        <dt className="text-sm text-gray-500">Contact Person</dt>
                        <dd>{hotel.additionalDetails.contactPerson}</dd>
                      </div>
                    )}
                    {hotel.additionalDetails?.contactEmail && (
                      <div className="flex flex-col">
                        <dt className="text-sm text-gray-500">Contact Email</dt>
                        <dd>{hotel.additionalDetails.contactEmail}</dd>
                      </div>
                    )}
                    {hotel.additionalDetails?.contactPhone && (
                      <div className="flex flex-col">
                        <dt className="text-sm text-gray-500">Contact Phone</dt>
                        <dd>{hotel.additionalDetails.contactPhone}</dd>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <dt className="text-sm text-gray-500">Rate Type</dt>
                      <dd>
                        <Badge variant="outline" className={hotel.additionalDetails?.hasNegotiatedRate ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                          {hotel.additionalDetails?.hasNegotiatedRate ? "Negotiated" : "Standard"}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {hotel.additionalDetails?.description && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{hotel.additionalDetails.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rooms" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Types</CardTitle>
            </CardHeader>
            <CardContent>
              {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Max Occupancy</TableHead>
                      <TableHead>Bed Options</TableHead>
                      <TableHead>Rate per Night</TableHead>
                      <TableHead>Per Person Rate</TableHead>
                      <TableHead>Units</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hotel.roomTypes.map((room: RoomType) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell>{room.maxOccupancy}</TableCell>
                        <TableCell>{room.bedOptions}</TableCell>
                        <TableCell>${room.ratePerNight.toFixed(2)}</TableCell>
                        <TableCell>${(room.ratePerPersonPerNight || 0).toFixed(2)}</TableCell>
                        <TableCell>{room.totalUnits}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No room types have been added yet.</p>
                  {permissions.canEditHotels && (
                    <Button asChild className="mt-4">
                      <Link to={`/hotels/${hotel.id}/edit`}>
                        Add Room Types
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HotelDetails;
