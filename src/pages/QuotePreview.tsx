
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Download, Printer, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCurrency } from "../contexts/CurrencyContext";
import { useRole } from "../contexts/RoleContext";

const QuotePreview = () => {
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  const { currentUser } = useRole();
  const [quoteData, setQuoteData] = useState<any>(null);
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
            <p><strong>Travelers:</strong> ${quoteData.travelers ? `${quoteData.travelers.adults} Adults${quoteData.travelers.children > 0 ? `, ${quoteData.travelers.children} Children` : ""}${quoteData.travelers.infants > 0 ? `, ${quoteData.travelers.infants} Infants` : ""}` : ""}</p>
            <h3>Accommodations</h3>
            <table>
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Room Type</th>
                  <th>Rate/Night</th>
                  <th>Nights</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${quoteData.hotels ? quoteData.hotels.map((hotel: any) => `
                  <tr>
                    <td>${hotel.name || "Not specified"}</td>
                    <td>${hotel.roomType || ""}</td>
                    <td>${hotel.ratePerNight || ""}</td>
                    <td>${hotel.nights || ""}</td>
                    <td>${hotel.total || ""}</td>
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
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                ${quoteData.transports ? quoteData.transports.map((transport: any) => `
                  <tr>
                    <td>${transport.type || ""}</td>
                    <td>${transport.description || "Not specified"}</td>
                    <td>${transport.cost || ""}</td>
                  </tr>
                `).join('') : ""}
              </tbody>
            </table>
            <div class="total">
              <p>Subtotal: ${quoteData.subtotal || ""}</p>
              <p>Markup: ${quoteData.markup?.amount || ""}</p>
              <p>Total: ${quoteData.grandTotal || ""}</p>
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
              <p className="text-sm text-gray-500">Created by: {currentUser.name}</p>
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
                Travelers: {quoteData.travelers && quoteData.travelers.adults} Adults
                {quoteData.travelers && quoteData.travelers.children > 0 && `, ${quoteData.travelers.children} Children`}
                {quoteData.travelers && quoteData.travelers.infants > 0 && `, ${quoteData.travelers.infants} Infants`}
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

          {quoteData.hotels && quoteData.hotels.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Accommodations</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Hotel</th>
                    <th className="text-left pb-2">Room Type</th>
                    <th className="text-right pb-2">Rate/Night</th>
                    <th className="text-right pb-2">Rooms</th>
                    <th className="text-right pb-2">Nights</th>
                    <th className="text-right pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.hotels.map((hotel: any, index: number) => (
                    <tr key={hotel.id || index} className="border-b">
                      <td className="py-2">{hotel.name || "Not specified"}</td>
                      <td className="py-2">{hotel.roomType}</td>
                      <td className="text-right py-2">{formatAmount(hotel.ratePerNight)}</td>
                      <td className="text-right py-2">{hotel.rooms}</td>
                      <td className="text-right py-2">{hotel.nights}</td>
                      <td className="text-right py-2">{formatAmount(hotel.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                  {quoteData.transports.map((transport: any, index: number) => (
                    <tr key={transport.id || index} className="border-b">
                      <td className="py-2">{transport.type}</td>
                      <td className="py-2">{transport.description || "Not specified"}</td>
                      <td className="text-right py-2">{formatAmount(transport.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div className="flex justify-between">
              <span>Accommodation Subtotal</span>
              <span>{formatAmount(quoteData.hotels?.reduce((sum: number, hotel: any) => sum + (hotel.total || 0), 0) || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transportation Subtotal</span>
              <span>{formatAmount(quoteData.transports?.reduce((sum: number, transport: any) => sum + (transport.cost || 0), 0) || 0)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatAmount(quoteData.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                {quoteData.markup?.type === "percentage" ? `Markup (${quoteData.markup.value}%)` : 
                quoteData.markup?.type === "fixed" ? "Markup (Fixed)" : 
                "Markup (Cost Plus 85%)"}
              </span>
              <span>{formatAmount(quoteData.markup?.amount || 0)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatAmount(quoteData.grandTotal || 0)}</span>
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
