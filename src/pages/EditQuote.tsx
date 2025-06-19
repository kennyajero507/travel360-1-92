
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useRole } from "../contexts/RoleContext";
import { useHotelsData } from "../hooks/useHotelsData";
import { useQuoteEditor } from "../hooks/useQuoteEditor";
import { useSimplifiedQuoteBuilder } from "../hooks/useSimplifiedQuoteBuilder";
import { CurrencyProvider } from "../contexts/CurrencyContext";
import ErrorBoundary from "../components/quote/ErrorBoundary";

// Components
import LoadingIndicator from "../components/quote/LoadingIndicator";
import SimplifiedQuoteBuilder from "../components/quote/SimplifiedQuoteBuilder";

const EditQuote = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  const { hotels, isLoading: hotelsLoading } = useHotelsData();
  
  // Use our custom hook for quote editing logic
  const {
    loading,
    quote,
    saving,
    handleSave,
    previewQuote
  } = useQuoteEditor(quoteId, role);

  // Use simplified quote builder logic
  const { isConverting, handleConvertToBooking, handleAddHotelForComparison } = useSimplifiedQuoteBuilder(
    quote || {} as any, 
    (updatedQuote) => {
      // This will be handled by the quote editor hook
      console.log('Quote updated:', updatedQuote);
    }
  );

  const [currentQuote, setCurrentQuote] = useState(quote);

  useEffect(() => {
    setCurrentQuote(quote);
  }, [quote]);

  const handleQuoteUpdate = (updatedQuote: any) => {
    setCurrentQuote(updatedQuote);
  };

  if (loading || hotelsLoading) {
    return <LoadingIndicator message="Loading quote data..." />;
  }
  
  if (!currentQuote) {
    return (
      <div className="text-center py-8">
        <p>Quote not found or unable to load quote data.</p>
        <Button className="mt-4" onClick={() => navigate("/quotes")}>
          Return to Quotes
        </Button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <CurrencyProvider>
        <div className="space-y-6">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/quotes")}>
              ← Back to Quotes
            </Button>
            <h1 className="text-2xl font-bold">Edit Quote - Simplified</h1>
          </div>

          {/* Simplified Quote Builder */}
          <ErrorBoundary>
            <SimplifiedQuoteBuilder
              quote={currentQuote}
              hotels={Array.isArray(hotels) ? hotels : []}
              onQuoteUpdate={handleQuoteUpdate}
              onSave={handleSave}
              onPreview={previewQuote}
              onConvertToBooking={handleConvertToBooking}
              onAddHotelForComparison={handleAddHotelForComparison}
              saving={saving || isConverting}
            />
          </ErrorBoundary>
        </div>
      </CurrencyProvider>
    </ErrorBoundary>
  );
};

export default EditQuote;
