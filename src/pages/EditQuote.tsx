import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useRole } from "../contexts/RoleContext";
import { useHotelsData } from "../hooks/useHotelsData";
import { useQuoteEditor } from "../hooks/useQuoteEditor";

// Components
import LoadingIndicator from "../components/quote/LoadingIndicator";
import QuoteHeader from "../components/quote/QuoteHeader";
import ClientDetailsCard from "../components/quote/ClientDetailsCard";
import HotelSelection from "../components/quote/HotelSelection";
import RoomArrangementSection from "../components/quote/RoomArrangementSection";
import HotelRoomList from "../components/quote/HotelRoomList";
import QuoteActionButtons from "../components/quote/QuoteActionButtons";

const EditQuote = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  const { hotels } = useHotelsData();
  
  // Use our custom hook for quote editing logic
  const {
    loading,
    quote,
    saving,
    selectedHotelId,
    handleHotelSelection,
    populateRoomArrangementsFromHotel,
    addRoomArrangement,
    handleRoomArrangementsChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote
  } = useQuoteEditor(quoteId, role);
  
  const [hotelRoomTypes, setHotelRoomTypes] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  
  // Update selected hotel when hotel ID changes
  useEffect(() => {
    if (selectedHotelId && hotels.length > 0) {
      const hotel = hotels.find(h => h.id === selectedHotelId);
      setSelectedHotel(hotel || null);
    } else {
      setSelectedHotel(null);
    }
  }, [selectedHotelId, hotels]);

  // Handle room types loaded from hotel selection
  const handleRoomTypesLoaded = (roomTypes: any[]) => {
    setHotelRoomTypes(roomTypes);
    
    // Populate room arrangements based on hotel room types
    if (quote && roomTypes.length > 0) {
      populateRoomArrangementsFromHotel(roomTypes, quote.duration.nights);
    }
  };
  
  // Handle adding a new room type to the quote
  const handleAddRoom = (roomType: any) => {
    if (quote) {
      addRoomArrangement(roomType, quote.duration.nights);
    }
  };
  
  if (loading) {
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
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <QuoteHeader 
        quoteId={quote.id || ""} 
        client={quote.client} 
        createdAt={quote.createdAt}
        saving={saving}
        handleSave={handleSave}
        previewQuote={previewQuote}
        emailQuote={emailQuote}
        downloadQuote={downloadQuote}
      />
      
      {/* Client Details Card */}
      <ClientDetailsCard
        client={quote.client}
        mobile={quote.mobile}
        destination={quote.destination}
        startDate={quote.startDate}
        endDate={quote.endDate}
        duration={quote.duration}
        status={quote.status}
      />
      
      {/* Hotel Selection */}
      <HotelSelection
        selectedHotelId={selectedHotelId}
        hotels={hotels}
        onHotelSelection={handleHotelSelection}
        onRoomTypesLoaded={handleRoomTypesLoaded}
      />
      
      {/* Hotel Room Types List (only show when a hotel is selected) */}
      {selectedHotelId && (
        <HotelRoomList 
          roomTypes={hotelRoomTypes}
          selectedHotel={selectedHotel}
          onAddRoom={handleAddRoom}
        />
      )}
      
      {/* Room Arrangements Section */}
      {quote.roomArrangements.length > 0 && (
        <RoomArrangementSection 
          roomArrangements={quote.roomArrangements}
          duration={quote.duration.nights}
          onRoomArrangementsChange={handleRoomArrangementsChange}
          availableRoomTypes={hotelRoomTypes.length > 0 
            ? hotelRoomTypes.map(rt => rt.name) 
            : ["Standard Room", "Deluxe Room", "Suite"]}
        />
      )}
      
      {/* Action Buttons */}
      <QuoteActionButtons
        saving={saving}
        handleSave={handleSave}
        onCancel={() => navigate("/quotes")}
      />
    </div>
  );
};

export default EditQuote;
