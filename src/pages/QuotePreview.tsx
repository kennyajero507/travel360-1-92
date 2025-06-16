import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import ClientQuotePreviewComponent from "../components/quote/ClientQuotePreview";
import { ClientQuotePreview as ClientQuotePreviewType } from "../types/quote.types";
import { updateQuoteStatus } from "../services/quote/core";
import { quotePreviewService } from "../services/quotePreviewService";
import { toast } from "sonner";
import LoadingIndicator from "../components/quote/LoadingIndicator";
import { AlertCircle, ArrowLeft } from "lucide-react";

const QuotePreview = () => {
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('id');
  const navigate = useNavigate();
  const [clientPreview, setClientPreview] = useState<ClientQuotePreviewType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [approvedHotelId, setApprovedHotelId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let previewData: ClientQuotePreviewType | null = null;
        
        // First try to load from session storage (from live editing)
        const storedPreview = sessionStorage.getItem('previewQuote');
        if (storedPreview) {
          try {
            previewData = JSON.parse(storedPreview);
            sessionStorage.removeItem('previewQuote');
          } catch (parseError) {
            console.error("Error parsing stored preview:", parseError);
          }
        } 
        // Otherwise, generate from API if we have an ID
        else if (quoteId) {
          previewData = await quotePreviewService.generateClientPreview(quoteId);
        }
        
        if (previewData) {
          setClientPreview(previewData);
        } else {
          setError("Quote preview could not be loaded. The quote may not exist or you may not have permission to view it.");
        }
      } catch (error) {
        console.error("Error loading quote preview:", error);
        setError("An error occurred while loading the quote preview. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [quoteId]);

  const handleApproveQuote = async () => {
    if (!clientPreview || !approvedHotelId) {
      toast.error("Please select a hotel option first");
      return;
    }

    setApproving(true);
    try {
      await updateQuoteStatus(clientPreview.id, "approved", approvedHotelId);
      toast.success("Quote approved successfully! We will contact you shortly to proceed with booking.");
      
      // Redirect to a thank you page or back to the main site
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error("Error approving quote:", error);
      toast.error("Failed to approve quote. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading quote preview..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Quote Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientPreview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Preview Unavailable</h1>
            <p className="text-gray-600 mb-6">
              The quote preview is temporarily unavailable. Please contact us directly for assistance.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <ClientQuotePreviewComponent
          quotePreview={clientPreview}
          onHotelSelect={setApprovedHotelId}
          selectedHotelId={approvedHotelId}
        />

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Not Interested
          </Button>
          <Button 
            onClick={handleApproveQuote}
            disabled={!approvedHotelId || approving}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {approving ? "Approving..." : "Approve & Proceed to Booking"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;
