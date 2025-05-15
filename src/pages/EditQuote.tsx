
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
import RoomArrangement from "../components/quote/RoomArrangement";
import QuoteActionButtons from "../components/quote/QuoteActionButtons";

// Available room types
const availableRoomTypes = [
  "Single Room",
  "Double Room",
  "Twin Room", 
  "Triple Room",
  "Quad Room",
  "Family Room"
];

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
    handleRoomArrangementsChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote
  } = useQuoteEditor(quoteId, role);
  
  const [availableRoomTypesFromHotel, setAvailableRoomTypesFromHotel] = 
    useState<string[]>(availableRoomTypes);
  
  // Update available room types when hotel is selected
  useEffect(() => {
    if (selectedHotelId && hotels.length > 0) {
      const selectedHotel = hotels.find(hotel => hotel.id === selectedHotelId);
      if (selectedHotel && selectedHotel.roomTypes && selectedHotel.roomTypes.length > 0) {
        const hotelRoomTypes = selectedHotel.roomTypes.map(roomType => roomType.name);
        setAvailableRoomTypesFromHotel(hotelRoomTypes);
      } else {
        setAvailableRoomTypesFromHotel(availableRoomTypes);
      }
    } else {
      setAvailableRoomTypesFromHotel(availableRoomTypes);
    }
  }, [selectedHotelId, hotels]);
  
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
      />
      
      {/* Room Arrangements Section */}
      <RoomArrangement 
        roomArrangements={quote.roomArrangements}
        duration={quote.duration.nights}
        onRoomArrangementsChange={handleRoomArrangementsChange}
        availableRoomTypes={availableRoomTypesFromHotel}
      />
      
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
