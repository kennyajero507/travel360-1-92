import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import ClientQuotePreviewComponent from "../components/quote/ClientQuotePreview";
import { ClientQuotePreview as ClientQuotePreviewType } from "../types/quote.types";
import { updateQuoteStatus } from "../services/quote/core";
import { generateClientPreview } from "../services/quote/client";
import { toast } from "sonner";
import LoadingIndicator from "../components/quote/LoadingIndicator";

const QuotePreview = () => {
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('id');
  const navigate = useNavigate();
  const [clientPreview, setClientPreview] = useState<ClientQuotePreviewType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [approvedHotelId, setApprovedHotelId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      
      try {
        let previewData: ClientQuotePreviewType | null = null;
        
        // First try to load from session storage (from live editing)
        const storedPreview = sessionStorage.getItem('previewQuote');
        if (storedPreview) {
          previewData = JSON.parse(storedPreview);
          sessionStorage.removeItem('previewQuote');
        } 
        // Otherwise, generate from API if we have an ID
        else if (quoteId) {
          previewData = await generateClientPreview(quoteId);
        }
        
        if (previewData) {
          setClientPreview(previewData);
        } else {
          toast.error("Quote preview could not be loaded");
        }
      } catch (error) {
        console.error("Error loading quote preview:", error);
        toast.error("Failed to load quote preview");
      } finally {
        setLoading(false);
      }
    };
    
    loadPreview();
  }, [quoteId]);
  
  useEffect(() => {
    if (clientPreview && clientPreview.hotelOptions && clientPreview.hotelOptions.length > 0) {
      // If preview data contains an approved hotel, store it
      const approved = clientPreview.hotelOptions.find(opt => opt.selected);
      setApprovedHotelId(approved ? approved.id : null);
    }
  }, [clientPreview]);

  const handleChoosePackage = async (hotelId: string) => {
    if (!quoteId) return;
    setApproving(true);
    try {
      await updateQuoteStatus(quoteId, "approved", hotelId);
      toast.success(`Package selected successfully!`);
      setApprovedHotelId(hotelId);
      // Refetch preview to update client UI
      const updatedPreview = await generateClientPreview(quoteId);
      if (updatedPreview) {
        setClientPreview(updatedPreview);
      }
    } catch (error) {
      console.error("Error selecting package:", error);
      toast.error("Failed to select package");
    } finally {
      setApproving(false);
    }
  };
  
  const handleRequestChanges = () => {
    toast.info("Change request sent to your travel consultant");
    // In a real app, this would send feedback to the agent
  };
  
  if (loading) {
    return <LoadingIndicator message="Loading quote preview..." />;
  }
  
  if (!clientPreview) {
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
    <div className="p-6">
      <ClientQuotePreviewComponent
        quote={clientPreview}
        onChoosePackage={handleChoosePackage}
        onRequestChanges={handleRequestChanges}
        approvedHotelId={approvedHotelId || undefined}
        approving={approving}
      />
    </div>
  );
};

export default QuotePreview;
