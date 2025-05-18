
import { useMemo } from "react";
import { QuoteData, Hotel, HotelSummary, RoomArrangement } from "../../types/quote.types";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { Hotel as HotelIcon } from "lucide-react";
import { useQuoteCalculations } from "../../hooks/useQuoteCalculations";

interface QuoteSummaryProps {
  quote: QuoteData;
  hotels: Hotel[];
  className?: string;
}

const QuoteSummary = ({ quote, hotels, className }: QuoteSummaryProps) => {
  const calculations = useQuoteCalculations(quote);
  
  // Group room arrangements by hotel
  const hotelSummaries = useMemo(() => {
    const summaries: HotelSummary[] = [];
    
    // Create a map of hotelId to hotel object
    const hotelMap = new Map<string, Hotel>();
    hotels.forEach(hotel => hotelMap.set(hotel.id, hotel));
    
    // Group room arrangements by hotel
    const hotelGroups = new Map<string, RoomArrangement[]>();
    quote.roomArrangements.forEach(arrangement => {
      const hotelId = arrangement.hotelId || 'unknown';
      if (!hotelGroups.has(hotelId)) {
        hotelGroups.set(hotelId, []);
      }
      hotelGroups.get(hotelId)?.push(arrangement);
    });
    
    // Create summaries for each hotel
    hotelGroups.forEach((arrangements, hotelId) => {
      const hotel = hotelMap.get(hotelId) || {
        id: hotelId,
        name: hotelId === 'unknown' ? 'Unknown Hotel' : `Hotel ${hotelId}`
      };
      
      const totalCost = arrangements.reduce((sum, arr) => sum + arr.total, 0);
      
      summaries.push({
        hotel,
        roomArrangements: arrangements,
        totalCost
      });
    });
    
    return summaries;
  }, [quote.roomArrangements, hotels]);
  
  // Calculate totals
  const transportTotal = calculations.calculateTransportSubtotal();
  const transferTotal = calculations.calculateTransfersSubtotal();
  const activityTotal = calculations.calculateActivitiesSubtotal();
  const hotelTotal = calculations.calculateAccommodationSubtotal();
  const subtotal = calculations.calculateSubtotal();
  const markup = calculations.calculateMarkup();
  const total = calculations.calculateGrandTotal();

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-xl font-semibold">Quote Summary</h2>
      
      {hotelSummaries.map((summary) => (
        <Card key={summary.hotel.id} className="border border-teal-100">
          <CardHeader className="bg-teal-50 pb-2">
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
                        <TableCell>{arrangement.roomType}</TableCell>
                        <TableCell className="text-right">{arrangement.numRooms}</TableCell>
                        <TableCell className="text-right">
                          {arrangement.adults + arrangement.childrenWithBed + arrangement.childrenNoBed}
                          {arrangement.infants > 0 && `+${arrangement.infants} infant(s)`}
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
              
              <div className="flex justify-between py-2 px-2 bg-teal-50 rounded-md">
                <span className="font-medium">Hotel Subtotal</span>
                <span className="font-medium">${summary.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="border border-teal-100">
        <CardHeader className="bg-teal-50 pb-2">
          <CardTitle className="text-lg text-teal-700">Quote Total</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {hotelTotal > 0 && (
              <div className="flex justify-between">
                <span>Accommodation</span>
                <span>${hotelTotal.toFixed(2)}</span>
              </div>
            )}
            {transportTotal > 0 && (
              <div className="flex justify-between">
                <span>Transportation</span>
                <span>${transportTotal.toFixed(2)}</span>
              </div>
            )}
            {transferTotal > 0 && (
              <div className="flex justify-between">
                <span>Transfers</span>
                <span>${transferTotal.toFixed(2)}</span>
              </div>
            )}
            {activityTotal > 0 && (
              <div className="flex justify-between">
                <span>Activities</span>
                <span>${activityTotal.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                {quote.markup.type === "percentage" 
                  ? `Markup (${quote.markup.value}%)` 
                  : "Markup"}
              </span>
              <span>${markup.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteSummary;
