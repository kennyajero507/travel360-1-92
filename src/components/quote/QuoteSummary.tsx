import { useMemo } from "react";
import { QuoteData, Hotel } from "../../types/quote.types";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { Hotel as HotelIcon, Check, EyeIcon } from "lucide-react";
import { useQuoteCalculations } from "../../hooks/useQuoteCalculations";
import { Button } from "../ui/button";
import { createBookingFromQuote } from "../../services/bookingService"; 
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QuoteSummaryProps {
  quote: QuoteData;
  hotels: Hotel[];
  className?: string;
  clientPreviewMode?: boolean;
  onHotelSelect?: (hotelId: string) => void;
  onRequestChanges?: () => void;
  onApproveQuote?: (hotelId: string) => void;
}

const QuoteSummary = ({ 
  quote, 
  hotels, 
  className, 
  clientPreviewMode = false,
  onHotelSelect,
  onRequestChanges,
  onApproveQuote
}: QuoteSummaryProps) => {
  const calculations = useQuoteCalculations(quote);
  const navigate = useNavigate();
  
  // Group room arrangements by hotel
  const hotelSummaries = useMemo(() => {
    // Use mock data if we're in client preview mode
    if (clientPreviewMode) {
      return hotels.map(hotel => ({
        hotel,
        final_price: Math.floor(Math.random() * 1000) + 1000,
        price_per_person: Math.floor(Math.random() * 100) + 150,
        pax_total: quote.travelers.adults + quote.travelers.childrenWithBed + quote.travelers.childrenNoBed
      }));
    }
    
    // Group room arrangements by hotelId
    const hotelGroups = new Map();
    quote.roomArrangements.forEach(arrangement => {
      const hotelId = arrangement.hotelId || 'unknown';
      if (!hotelGroups.has(hotelId)) {
        hotelGroups.set(hotelId, []);
      }
      hotelGroups.get(hotelId).push(arrangement);
    });
    
    // Create summaries for each hotel
    const summaries = [];
    
    // Create a map of hotelId to hotel object
    const hotelMap = new Map();
    hotels.forEach(hotel => {
      if (hotel && hotel.id) {
        hotelMap.set(hotel.id, hotel);
      }
    });
    
    hotelGroups.forEach((arrangements, hotelId) => {
      const hotel = hotelMap.get(hotelId) || {
        id: hotelId,
        name: hotelId === 'unknown' ? 'Unknown Hotel' : `Hotel ${hotelId}`
      };
      
      const accommodationTotal = arrangements.reduce((sum, arr) => sum + arr.total, 0);
      const transportTotal = calculations.calculateTransportSubtotal();
      const transferTotal = calculations.calculateTransfersSubtotal();
      const activityTotal = calculations.calculateActivitiesSubtotal();
      const subtotal = accommodationTotal + transportTotal + transferTotal + activityTotal;
      
      // Apply markup based on the quote's markup type
      let finalPrice = subtotal;
      if (quote.markup.type === "percentage") {
        // Calculate the price with markup included
        // formula: finalPrice = subtotal / (1 - (markup / 100))
        finalPrice = subtotal / (1 - (quote.markup.value / 100));
      } else {
        // Fixed markup
        finalPrice = subtotal + quote.markup.value;
      }
      
      const totalTravelers = quote.travelers.adults + quote.travelers.childrenWithBed + 
        quote.travelers.childrenNoBed + quote.travelers.infants;
      
      summaries.push({
        hotel,
        roomArrangements: arrangements,
        accommodationTotal,
        transportTotal,
        transferTotal,
        activityTotal,
        subtotal,
        finalPrice,
        pricePerPerson: totalTravelers > 0 ? finalPrice / totalTravelers : finalPrice,
        paxTotal: totalTravelers,
      });
    });
    
    return summaries;
  }, [quote.roomArrangements, quote.travelers, quote.markup, hotels, calculations, clientPreviewMode]);
  
  // Handler for quote approval
  const handleApproveQuote = async (hotelId: string) => {
    try {
      // Call the onApproveQuote callback if provided (for custom handling)
      if (onApproveQuote) {
        onApproveQuote(hotelId);
        return;
      }
      
      // Otherwise create a booking from the quote
      const booking = await createBookingFromQuote(quote.id!, hotelId);
      
      if (booking) {
        toast.success("Quote approved! Booking created successfully.", {
          description: `Booking reference: ${booking.booking_reference}`,
          action: {
            label: "View Booking",
            onClick: () => navigate(`/bookings/${booking.id}`)
          }
        });
      }
    } catch (error) {
      console.error("Error approving quote:", error);
      toast.error("Failed to approve quote and create booking");
    }
  };
  
  // Client preview mode - simplified view
  if (clientPreviewMode) {
    return (
      <div className={cn("space-y-8", className)}>
        <h2 className="text-2xl font-bold text-center text-teal-700">
          Hotel Options for Your Trip
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotelSummaries.map((summary) => (
            <Card 
              key={summary.hotel.id} 
              className="border border-teal-100 hover:border-teal-300 transition-all hover:shadow-md"
            >
              <CardHeader className="bg-teal-50 pb-2">
                <div className="flex items-center gap-2">
                  <HotelIcon className="h-5 w-5 text-teal-600" />
                  <CardTitle className="text-xl text-teal-700">
                    {summary.hotel.name}
                  </CardTitle>
                </div>
                {summary.hotel.category && (
                  <span className="text-sm font-normal text-teal-600 ml-7">
                    {summary.hotel.category}
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Travel Dates</span>
                    <span>{new Date(quote.startDate).toLocaleDateString()} - {new Date(quote.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>No. of People</span>
                    <span>{summary.pax_total}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Package Price</span>
                    <span>${summary.final_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Price Per Person</span>
                    <span>${summary.price_per_person.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="border-teal-300 hover:bg-teal-50" 
                    onClick={() => onHotelSelect?.(summary.hotel.id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => handleApproveQuote(summary.hotel.id)}
                  >
                    <Check className="w-4 h-4 mr-2" /> Approve This Option
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            className="border-red-300 hover:bg-red-50 hover:text-red-600"
            onClick={onRequestChanges}
          >
            Request Changes to Quote
          </Button>
        </div>
      </div>
    );
  }

  // Regular view (for agents/tour operators)
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Quote Summary</h2>
        
        {/* Toggle for client view */}
        <Button variant="outline" size="sm" onClick={() => window.open(`/quote-preview?id=${quote.id}`, '_blank')}>
          <EyeIcon className="h-4 w-4 mr-2" />
          Client Preview
        </Button>
      </div>
      
      {hotelSummaries.map((summary) => (
        <Card key={summary.hotel.id} className="border border-teal-100">
          <CardHeader className="bg-teal-50 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HotelIcon className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-lg text-teal-700">
                  {summary.hotel.name}
                  {summary.hotel.category && 
                    <span className="text-sm font-normal ml-2 text-teal-600">
                      {summary.hotel.category}
                    </span>
                  }
                </CardTitle>
              </div>
              
              {/* Add approve button for agent view */}
              {quote.status !== 'approved' && (
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveQuote(summary.hotel.id)}
                >
                  <Check className="w-4 h-4 mr-1" /> Approve & Create Booking
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Room Arrangements</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Type</TableHead>
                      <TableHead className="text-right">Rooms</TableHead>
                      <TableHead className="text-right">Guests</TableHead>
                      <TableHead className="text-right">Nights</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.roomArrangements.map((arrangement) => (
                      <TableRow key={arrangement.id}>
                        <TableCell>{arrangement.roomType || "Standard Room"}</TableCell>
                        <TableCell className="text-right">{arrangement.numRooms}</TableCell>
                        <TableCell className="text-right">
                          {arrangement.adults + arrangement.childrenWithBed + arrangement.childrenNoBed}
                          {arrangement.infants > 0 && ` +${arrangement.infants} infant(s)`}
                        </TableCell>
                        <TableCell className="text-right">{arrangement.nights}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${arrangement.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="space-y-2">
                {summary.accommodationTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Accommodation</span>
                    <span>${summary.accommodationTotal.toFixed(2)}</span>
                  </div>
                )}
                {summary.transportTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Transportation</span>
                    <span>${summary.transportTotal.toFixed(2)}</span>
                  </div>
                )}
                {summary.transferTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Transfers</span>
                    <span>${summary.transferTotal.toFixed(2)}</span>
                  </div>
                )}
                {summary.activityTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Activities</span>
                    <span>${summary.activityTotal.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {quote.markup.type === "percentage" 
                      ? `Markup (${quote.markup.value}%)` 
                      : "Markup"}
                  </span>
                  <span>${(summary.finalPrice - summary.subtotal).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Final Price</span>
                  <span>${summary.finalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Price Per Person</span>
                  <span>${summary.pricePerPerson.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuoteSummary;
