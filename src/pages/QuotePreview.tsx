
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCurrency } from "../contexts/CurrencyContext";

const QuotePreview = () => {
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get quote data from session storage
    const data = sessionStorage.getItem('previewQuote');
    if (data) {
      setQuoteData(JSON.parse(data));
    } else {
      toast.error("No quote data found for preview");
      navigate("/quotes");
    }
    setLoading(false);
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Quote downloaded as PDF");
    // In a real app, this would generate and download a PDF
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!quoteData) {
    return <div className="flex items-center justify-center h-screen">No quote data found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">Quote Preview</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload}>
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
              <p className="text-gray-500">Ref: TRV-{Math.floor(Math.random() * 10000)}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">TravelFlow Inc.</p>
              <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Client Information</h3>
              <p>Name: {quoteData.client}</p>
              <p>Travelers: {quoteData.travelers}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Trip Details</h3>
              <p>Destination: {quoteData.destination}</p>
              <p>Dates: {new Date(quoteData.startDate).toLocaleDateString()} - {new Date(quoteData.endDate).toLocaleDateString()}</p>
              <p>Duration: {quoteData.duration.days} days / {quoteData.duration.nights} nights</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">Accommodations</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Hotel</th>
                  <th className="text-right pb-2">Rate/Night</th>
                  <th className="text-right pb-2">Nights</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {quoteData.hotels.map((hotel: any) => (
                  <tr key={hotel.id} className="border-b">
                    <td className="py-2">{hotel.name || "Not specified"}</td>
                    <td className="text-right py-2">{formatAmount(hotel.ratePerNight)}</td>
                    <td className="text-right py-2">{hotel.nights}</td>
                    <td className="text-right py-2">{formatAmount(hotel.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                {quoteData.transports.map((transport: any) => (
                  <tr key={transport.id} className="border-b">
                    <td className="py-2">{transport.type}</td>
                    <td className="py-2">{transport.description || "Not specified"}</td>
                    <td className="text-right py-2">{formatAmount(transport.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div className="flex justify-between">
              <span>Accommodation Subtotal</span>
              <span>{formatAmount(quoteData.hotels.reduce((sum: number, hotel: any) => sum + hotel.total, 0))}</span>
            </div>
            <div className="flex justify-between">
              <span>Transportation Subtotal</span>
              <span>{formatAmount(quoteData.transports.reduce((sum: number, transport: any) => sum + transport.cost, 0))}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatAmount(quoteData.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                {quoteData.markup.type === "percentage" ? `Markup (${quoteData.markup.value}%)` : 
                quoteData.markup.type === "fixed" ? "Markup (Fixed)" : 
                "Markup (Cost Plus 85%)"}
              </span>
              <span>{formatAmount(quoteData.markup.amount)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatAmount(quoteData.grandTotal)}</span>
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
