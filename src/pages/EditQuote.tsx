
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useRole } from "../contexts/RoleContext";
import { useHotelsData } from "../hooks/useHotelsData";
import { useQuoteEditor } from "../hooks/useQuoteEditor";
import { CurrencyProvider } from "../contexts/CurrencyContext";
import ErrorBoundary from "../components/quote/ErrorBoundary";

// Components
import LoadingIndicator from "../components/quote/LoadingIndicator";
import QuoteBuilder from "../components/quote/QuoteBuilder";
import ClientDetailsEditableSection from "../components/quote/ClientDetailsEditableSection";
import HotelSelectionSection from "../components/quote/HotelSelectionSection";
import AccommodationSection from "../components/quote/AccommodationSection";
import TransportBookingSection from "../components/quote/TransportBookingSection";
import TransferSection from "../components/quote/TransferSection";
import ExcursionSection from "../components/quote/ExcursionSection";
import MultiHotelQuoteComparison from "../components/quote/MultiHotelQuoteComparison";

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
    selectedHotels,
    handleHotelSelection,
    removeSelectedHotel,
    populateRoomArrangementsFromHotel,
    handleRoomArrangementsChange,
    handleTransfersChange,
    handleTransportsChange,
    handleActivitiesChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote
  } = useQuoteEditor(quoteId, role);
  
  const [selectedHotelObjects, setSelectedHotelObjects] = useState<any[]>([]);
  
  // Update selected hotel objects when selectedHotels changes
  useEffect(() => {
    if (Array.isArray(hotels) && hotels.length > 0 && Array.isArray(selectedHotels) && selectedHotels.length > 0) {
      const hotelObjects = selectedHotels
        .map(id => hotels.find(h => h.id === id))
        .filter(hotel => hotel !== undefined);
      setSelectedHotelObjects(hotelObjects);
    } else {
      setSelectedHotelObjects([]);
    }
  }, [selectedHotels, hotels]);

  const handleQuoteUpdate = (updatedQuote: any) => {
    console.log('Quote updated:', updatedQuote);
  };

  const handleRoomTypesLoaded = (roomTypes: any[], hotelId: string) => {
    if (quote && Array.isArray(roomTypes) && roomTypes.length > 0) {
      populateRoomArrangementsFromHotel(roomTypes, quote.duration_nights || 1, hotelId);
    }
  };

  if (loading || hotelsLoading) {
    return <LoadingIndicator message="Loading quote data..." />;
  }
  
  if (!quote) {
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
          <ErrorBoundary>
            <QuoteBuilder
              quote={quote}
              hotels={Array.isArray(hotels) ? hotels : []}
              selectedHotels={selectedHotelObjects}
              onQuoteUpdate={handleQuoteUpdate}
              onSave={handleSave}
              onPreview={previewQuote}
              onEmail={emailQuote}
              onDownload={downloadQuote}
              saving={saving}
            />
          </ErrorBoundary>

          {/* Client Details Section */}
          <ErrorBoundary>
            <div data-section="client">
              <ClientDetailsEditableSection 
                quote={quote} 
                onQuoteUpdate={handleQuoteUpdate} 
              />
            </div>
          </ErrorBoundary>

          {/* Hotel Selection Section */}
          <ErrorBoundary>
            <div data-section="hotels">
              <HotelSelectionSection
                selectedHotels={selectedHotelObjects}
                availableHotels={Array.isArray(hotels) ? hotels : []}
                onHotelSelection={handleHotelSelection}
                onHotelRemove={removeSelectedHotel}
                onRoomTypesLoaded={handleRoomTypesLoaded}
              />
            </div>
          </ErrorBoundary>
          
          {/* Accommodation Section */}
          <ErrorBoundary>
            <div data-section="accommodation">
              <AccommodationSection
                selectedHotels={selectedHotelObjects}
                roomArrangements={Array.isArray(quote.room_arrangements) ? quote.room_arrangements : []}
                onRoomArrangementsChange={handleRoomArrangementsChange}
                availableRoomTypes={["Standard Room", "Deluxe Room", "Suite", "Family Room"]}
                duration={quote.duration_nights || 1}
              />
            </div>
          </ErrorBoundary>
          
          {/* Transport Section */}
          <ErrorBoundary>
            <div data-section="transport">
              <TransportBookingSection
                transports={Array.isArray(quote.transports) ? quote.transports : []}
                onTransportsChange={handleTransportsChange}
              />
            </div>
          </ErrorBoundary>
          
          {/* Transfer Section */}
          <ErrorBoundary>
            <div data-section="transfer">
              <TransferSection 
                transfers={Array.isArray(quote.transfers) ? quote.transfers : []} 
                onTransfersChange={handleTransfersChange}
              />
            </div>
          </ErrorBoundary>
          
          {/* Activities Section */}
          <ErrorBoundary>
            <div data-section="excursion">
              <ExcursionSection
                excursions={Array.isArray(quote.activities) ? quote.activities : []}
                onExcursionsChange={handleActivitiesChange}
              />
            </div>
          </ErrorBoundary>
          
          {/* Multi-Hotel Comparison Summary */}
          <ErrorBoundary>
            <div data-section="summary">
              <MultiHotelQuoteComparison
                quote={quote}
                hotels={selectedHotelObjects}
                viewMode="agent"
                markupPercentage={quote.markup_value || 25}
              />
            </div>
          </ErrorBoundary>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => navigate("/quotes")}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? "Saving..." : "Save Quote"}
              </Button>
              <Button
                onClick={previewQuote}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Preview
              </Button>
            </div>
          </div>
        </div>
      </CurrencyProvider>
    </ErrorBoundary>
  );
};

export default EditQuote;
