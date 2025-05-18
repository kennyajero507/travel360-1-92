import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Download, Printer, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCurrency } from "../contexts/CurrencyContext";
import { useRole } from "../contexts/RoleContext";
import { QuoteData } from "../types/quote.types";

const QuotePreview = () => {
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  const { currentUser } = useRole();
  const [quoteData, setQuoteData] = useState<QuoteData & {
    subtotal?: number;
    markup?: { amount: number; type: string; value: number };
    grandTotal?: number;
    perPersonCost?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get quote data from session storage
    const data = sessionStorage.getItem('previewQuote');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log("Quote preview data:", parsedData);
        setQuoteData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error("Error parsing quote data:", err);
        setError("Failed to parse quote data");
        setLoading(false);
        toast.error("Error loading quote data");
      }
    } else {
      console.error("No quote data found in session storage");
      setError("No quote data found");
      setLoading(false);
      toast.error("No quote data found for preview");
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!quoteData) return;
    
    // Create HTML content for the PDF
    const pdfContent = `
      <html>
        <head>
          <title>Quote ${quoteData.id || "Preview"}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .quote-details { margin-top: 20px; border: 1px solid #ddd; padding: 15px; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; text-align: right; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TravelFlow Quote</h1>
            <p>Ref: ${quoteData.id || "TRV-" + Math.floor(Math.random() * 10000)}</p>
          </div>
          <div class="quote-details">
            <p><strong>Client:</strong> ${quoteData.client}</p>
            <p><strong>Destination:</strong> ${quoteData.destination}</p>
            <p><strong>Dates:</strong> ${quoteData.startDate ? new Date(quoteData.startDate).toLocaleDateString() : ""} - ${quoteData.endDate ? new Date(quoteData.endDate).toLocaleDateString() : ""}</p>
            <p><strong>Duration:</strong> ${quoteData.duration ? `${quoteData.duration.days} days / ${quoteData.duration.nights} nights` : ""}</p>
            <p><strong>Travelers:</strong> ${quoteData.travelers ? 
              `${quoteData.travelers.adults} Adults` + 
              (quoteData.travelers.childrenWithBed > 0 ? `, ${quoteData.travelers.childrenWithBed} Child with Bed` : "") +
              (quoteData.travelers.childrenNoBed > 0 ? `, ${quoteData.travelers.childrenNoBed} Child No Bed` : "") +
              (quoteData.travelers.infants > 0 ? `, ${quoteData.travelers.infants} Infants` : "") : ""}</p>
            
            <h3>Room Arrangements</h3>
            <table>
              <thead>
                <tr>
                  <th>Room Type</th>
                  <th>Rooms</th>
                  <th>Occupants</th>
                  <th>Nights</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${quoteData.roomArrangements ? quoteData.roomArrangements.map(room => `
                  <tr>
                    <td>${room.roomType}</td>
                    <td>${room.numRooms}</td>
                    <td>
                      ${room.adults} Adults
                      ${room.childrenWithBed > 0 ? `, ${room.childrenWithBed} CWB` : ""}
                      ${room.childrenNoBed > 0 ? `, ${room.childrenNoBed} CNB` : ""}
                      ${room.infants > 0 ? `, ${room.infants} Infants` : ""}
                    </td>
                    <td>${room.nights}</td>
                    <td>$${room.total.toFixed(2)}</td>
                  </tr>
                `).join('') : ""}
              </tbody>
            </table>
            
            <h3>Activities & Experiences</h3>
            <table>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Description</th>
                  <th>Participants</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                ${quoteData.activities ? quoteData.activities.map(activity => `
                  <tr>
                    <td>${activity.name || "Not specified"}</td>
                    <td>${activity.description || ""}</td>
                    <td>
                      ${activity.included.adults} Adults
                      ${activity.included.children > 0 ? `, ${activity.included.children} Children` : ""}
                      ${activity.included.infants > 0 ? `, ${activity.included.infants} Infants` : ""}
                    </td>
                    <td>$${activity.total.toFixed(2)}</td>
                  </tr>
                `).join('') : ""}
              </tbody>
            </table>
            
            <h3>Transportation</h3>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Passengers</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                ${quoteData.transports ? quoteData.transports.map(transport => `
                  <tr>
                    <td>${transport.type || ""}</td>
                    <td>${transport.description || "Not specified"}</td>
                    <td>
                      ${transport.included.adults} Adults
                      ${transport.included.children > 0 ? `, ${transport.included.children} Children` : ""}
                      ${transport.included.infants > 0 ? `, ${transport.included.infants} Infants` : ""}
                    </td>
                    <td>$${transport.total.toFixed(2)}</td>
                  </tr>
                `).join('') : ""}
              </tbody>
            </table>
            
            <div class="total">
              <p>Subtotal: $${quoteData.subtotal?.toFixed(2) || "0.00"}</p>
              <p>Markup (${quoteData.markup?.type === "percentage" ? quoteData.markup.value + "%" : 
                           "Fixed"}): 
                 $${quoteData.markup?.amount.toFixed(2) || "0.00"}</p>
              <p>Total: $${quoteData.grandTotal?.toFixed(2) || "0.00"}</p>
              <p>Per Person: $${quoteData.perPersonCost?.toFixed(2) || "0.00"}</p>
            </div>
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
    link.download = `Quote-${quoteData.id || "Preview"}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Quote downloaded as PDF");
  };

  const handleEmail = () => {
    toast.success("Quote sent to client via email");
    // In a real app, this would send an email
  };

  const handleBack = () => {
    navigate("/quotes");
  };

  const MarkupSection = () => {
    return (
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between py-2">
          <span>
            {quoteData.markup?.type === "percentage" 
              ? `Markup (${quoteData.markup.value}%)` 
              : "Markup (Fixed)"}
          </span>
          <span>${quoteData.markup?.amount.toFixed(2) || "0.00"}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error || !quoteData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error || "No quote data found"}</p>
        <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Quotes
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Quote Preview</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <CardTitle className="text-2xl">Travel Itinerary Quote</CardTitle>
              <p className="text-gray-500">Ref: {quoteData.id || `TRV-${Math.floor(Math.random() * 10000)}`}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">TravelFlow Inc.</p>
              <p className="text-sm text-gray-500">Created by: {currentUser?.name}</p>
              <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Client Information</h3>
              <p>Name: {quoteData.client}</p>
              <p>Mobile: {quoteData.mobile}</p>
              <p>
                Travelers: {quoteData.travelers.adults} Adults
                {quoteData.travelers.childrenWithBed > 0 && `, ${quoteData.travelers.childrenWithBed} Child with Bed`}
                {quoteData.travelers.childrenNoBed > 0 && `, ${quoteData.travelers.childrenNoBed} Child No Bed`}
                {quoteData.travelers.infants > 0 && `, ${quoteData.travelers.infants} Infants`}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Trip Details</h3>
              <p>Destination: {quoteData.destination}</p>
              <p>Dates: {new Date(quoteData.startDate).toLocaleDateString()} - {new Date(quoteData.endDate).toLocaleDateString()}</p>
              <p>Duration: {quoteData.duration?.days} days / {quoteData.duration?.nights} nights</p>
            </div>
          </div>

          <Separator />

          {/* Room Arrangements Section */}
          {quoteData.roomArrangements && quoteData.roomArrangements.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Room Arrangements</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Room Type</th>
                    <th className="text-center pb-2">Rooms</th>
                    <th className="text-left pb-2">Occupants</th>
                    <th className="text-center pb-2">Nights</th>
                    <th className="text-right pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.roomArrangements.map((room, index) => (
                    <tr key={room.id || index} className="border-b">
                      <td className="py-2">{room.roomType}</td>
                      <td className="text-center py-2">{room.numRooms}</td>
                      <td className="py-2">
                        {room.adults} Adults
                        {room.childrenWithBed > 0 && `, ${room.childrenWithBed} CWB`}
                        {room.childrenNoBed > 0 && `, ${room.childrenNoBed} CNB`}
                        {room.infants > 0 && `, ${room.infants} Infants`}
                      </td>
                      <td className="text-center py-2">{room.nights}</td>
                      <td className="text-right py-2">${room.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Activities Section */}
          {quoteData.activities && quoteData.activities.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Activities & Experiences</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Activity</th>
                    <th className="text-left pb-2">Description</th>
                    <th className="text-right pb-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.activities.map((activity, index) => (
                    <tr key={activity.id || index} className="border-b">
                      <td className="py-2">{activity.name}</td>
                      <td className="py-2">{activity.description || "Not specified"}</td>
                      <td className="text-right py-2">${activity.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Transports Section */}
          {quoteData.transports && quoteData.transports.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Transportation</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Type</th>
                    <th className="text-left pb-2">Description</th>
                    <th className="text-right pb-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.transports.map((transport, index) => (
                    <tr key={transport.id || index} className="border-b">
                      <td className="py-2">{transport.type}</td>
                      <td className="py-2">{transport.description || "Not specified"}</td>
                      <td className="text-right py-2">${transport.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div className="flex justify-between">
              <span>Accommodation Subtotal</span>
              <span>${quoteData.roomArrangements?.reduce((sum, room) => sum + room.total, 0).toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span>Activities Subtotal</span>
              <span>${quoteData.activities?.reduce((sum, activity) => sum + activity.total, 0).toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span>Transportation Subtotal</span>
              <span>${quoteData.transports?.reduce((sum, transport) => sum + transport.total, 0).toFixed(2) || "0.00"}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${quoteData.subtotal?.toFixed(2) || "0.00"}</span>
            </div>
            <MarkupSection />
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${quoteData.grandTotal?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between text-blue-600 font-medium">
              <span>Per Person</span>
              <span>${quoteData.perPersonCost?.toFixed(2) || "0.00"}</span>
            </div>
          </div>

          {quoteData.notes && (
            <div>
              <h3 className="font-medium mb-2">Additional Notes</h3>
              <p className="text-gray-700">{quoteData.notes}</p>
            </div>
          )}

          <div className="space-y-2 text-gray-500 text-sm">
            <p>This quote is valid for 14 days from the date of issue.</p>
            <p>Prices are subject to availability at the time of booking.</p>
            <p>Payment terms: 30% deposit to confirm booking, balance due 45 days before departure.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotePreview;
