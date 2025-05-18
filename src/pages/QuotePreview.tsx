import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useHotelsData } from "../hooks/useHotelsData";
import QuoteSummary from "../components/quote/QuoteSummary";
import { QuoteData } from "../types/quote.types";
import { getQuoteById } from "../services/quoteService";
import { toast } from "sonner";
import LoadingIndicator from "../components/quote/LoadingIndicator";

const QuotePreview = () => {
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('id');
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { hotels } = useHotelsData();
  const [selectedHotels, setSelectedHotels] = useState<any[]>([]);
  
  useEffect(() => {
    // Load quote from session storage or from API
    const loadQuote = async () => {
      setLoading(true);
      
      try {
        let quoteData: QuoteData | null = null;
        
        // First try to load from session storage (from live editing)
        const storedQuote = sessionStorage.getItem('previewQuote');
        if (storedQuote) {
          quoteData = JSON.parse(storedQuote);
          sessionStorage.removeItem('previewQuote'); // Clear after loading
        } 
        // Otherwise, load from API if we have an ID
        else if (quoteId) {
          quoteData = await getQuoteById(quoteId);
        }
        
        if (quoteData) {
          setQuote(quoteData);
          
          // Load hotels related to this quote
          if (hotels.length > 0 && quoteData.roomArrangements.length > 0) {
            // Find unique hotel IDs in room arrangements
            const hotelIds = new Set<string>();
            quoteData.roomArrangements.forEach(arr => {
              if (arr.hotelId) {
                hotelIds.add(arr.hotelId);
              }
            });
            
            // Filter hotels by these IDs
            const quoteHotels = hotels.filter(h => hotelIds.has(h.id));
            setSelectedHotels(quoteHotels);
          }
        } else {
          toast.error("Quote data could not be loaded");
        }
      } catch (error) {
        console.error("Error loading quote data for preview:", error);
        toast.error("Failed to load quote data");
      } finally {
        setLoading(false);
      }
    };
    
    loadQuote();
  }, [quoteId, hotels]);
  
  // Handle selecting a hotel to view details
  const handleHotelSelect = (hotelId: string) => {
    toast.info(`Viewing details for hotel ${hotelId}`);
    // In a real app, this would show detailed info about the selected hotel
  };
  
  // Handle requesting changes to the quote
  const handleRequestChanges = () => {
    toast.info("Requested changes to the quote");
    // In a real app, this would send feedback to the agent
  };
  
  // Handle approving a hotel option
  const handleApproveQuote = (hotelId: string) => {
    toast.success(`Quote approved with hotel ${hotelId}`);
    // In a real app, this would update the quote status and selected hotel
  };
  
  if (loading) {
    return <LoadingIndicator message="Loading quote preview..." />;
  }
  
  if (!quote) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quote Not Found</h2>
            <p className="text-gray-600 mb-6">The requested quote could not be loaded.</p>
            <Button onClick={() => navigate('/quotes')}>Return to Quotes</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card className="border border-teal-100">
        <CardHeader className="bg-teal-50">
          <CardTitle className="text-2xl font-bold text-teal-800">
            Your Travel Quote
          </CardTitle>
          <p className="text-sm text-teal-600">
            Prepared for {quote.client} on {new Date(quote.createdAt || "").toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Trip Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium">{quote.destination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Travel Dates</p>
                <p className="font-medium">
                  {new Date(quote.startDate).toLocaleDateString()} - {new Date(quote.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{quote.duration.nights} nights</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Travelers</p>
                <p className="font-medium">
                  {quote.travelers.adults + quote.travelers.childrenWithBed + quote.travelers.childrenNoBed + quote.travelers.infants} people
                </p>
              </div>
            </div>
          </div>
          
          <QuoteSummary 
            quote={quote}
            hotels={selectedHotels}
            clientPreviewMode={true}
            onHotelSelect={handleHotelSelect}
            onRequestChanges={handleRequestChanges}
            onApproveQuote={handleApproveQuote}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotePreview;
