
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
import TransferSection from "../components/quote/TransferSection";
import QuoteSummary from "../components/quote/QuoteSummary";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Plus, Hotel, Bus, MapPin, Compass, FileText, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";

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
    selectedHotels,
    editorStage,
    handleStageChange,
    handleHotelSelection,
    removeSelectedHotel,
    populateRoomArrangementsFromHotel,
    addRoomArrangement,
    handleRoomArrangementsChange,
    handleTransfersChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote,
    isHotelSelectionComplete
  } = useQuoteEditor(quoteId, role);
  
  const [hotelRoomTypes, setHotelRoomTypes] = useState<any[]>([]);
  const [selectedHotelObjects, setSelectedHotelObjects] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("edit");
  
  // Update selected hotel when hotel ID changes
  useEffect(() => {
    if (selectedHotelId && hotels.length > 0) {
      const hotel = hotels.find(h => h.id === selectedHotelId);
      setSelectedHotel(hotel || null);
    } else {
      setSelectedHotel(null);
    }
  }, [selectedHotelId, hotels]);
  
  // Update selected hotel objects when selectedHotels changes
  useEffect(() => {
    if (hotels.length > 0 && selectedHotels.length > 0) {
      const hotelObjects = selectedHotels
        .map(id => hotels.find(h => h.id === id))
        .filter(hotel => hotel !== undefined);
      setSelectedHotelObjects(hotelObjects);
    } else {
      setSelectedHotelObjects([]);
    }
  }, [selectedHotels, hotels]);

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
  
  const MAX_HOTELS = 2; // Maximum number of hotels allowed for comparison
  
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
        isHotelSelectionRequired={!isHotelSelectionComplete()}
        disableSave={editorStage === 'hotel-selection' && !isHotelSelectionComplete()}
        stage={editorStage}
        onStageChange={handleStageChange}
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
      
      {/* Hotel Selection Stage */}
      {editorStage === 'hotel-selection' && (
        <Card className="border border-teal-100">
          <CardHeader className="bg-teal-50 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-lg text-teal-700">Select Hotels</CardTitle>
              </div>
              <Badge variant={selectedHotelObjects.length > 0 ? "outline" : "destructive"}>
                {selectedHotelObjects.length} of {MAX_HOTELS} Hotels Selected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Hotel Selection */}
            <div>
              <h3 className="text-md font-medium mb-4">Add a Hotel</h3>
              <HotelSelection
                selectedHotelId={selectedHotelId}
                hotels={hotels}
                onHotelSelection={handleHotelSelection}
                onRoomTypesLoaded={handleRoomTypesLoaded}
                isRequired={true}
                maxHotels={MAX_HOTELS}
                selectedHotelsCount={selectedHotelObjects.length}
              />
            </div>
            
            {/* Selected Hotels List */}
            {selectedHotelObjects.length > 0 && (
              <div className="space-y-6">
                {selectedHotelObjects.map(hotel => (
                  <Card key={hotel.id} className="border border-gray-200">
                    <CardHeader className="bg-gray-50 flex flex-row justify-between items-center py-3">
                      <div>
                        <h4 className="text-md font-medium">{hotel.name}</h4>
                        <p className="text-sm text-gray-500">{hotel.category} • {hotel.destination}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeSelectedHotel(hotel.id)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove Hotel
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {/* Hotel Room Types List */}
                      <div className="mb-4">
                        <h3 className="text-md font-medium mb-4">Available Room Types</h3>
                        <HotelRoomList 
                          roomTypes={hotel.roomTypes || []}
                          selectedHotel={hotel}
                          onAddRoom={(roomType) => addRoomArrangement(roomType, quote.duration.nights, hotel.id)}
                        />
                      </div>
                      
                      {/* Room Arrangements Section for this hotel */}
                      {quote.roomArrangements.filter(arr => arr.hotelId === hotel.id).length > 0 ? (
                        <div>
                          <h3 className="text-md font-medium mb-4">Room Arrangements</h3>
                          <RoomArrangementSection 
                            roomArrangements={quote.roomArrangements.filter(arr => arr.hotelId === hotel.id)}
                            duration={quote.duration.nights}
                            onRoomArrangementsChange={(arrangements) => {
                              // Preserve arrangements for other hotels
                              const otherHotelsArrangements = quote.roomArrangements.filter(arr => arr.hotelId !== hotel.id);
                              handleRoomArrangementsChange([...otherHotelsArrangements, ...arrangements]);
                            }}
                            availableRoomTypes={hotel.roomTypes?.map((rt: any) => rt.name) || ["Standard Room", "Deluxe Room", "Suite"]}
                            hotelId={hotel.id}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-gray-200 rounded-md">
                          <p className="text-gray-500">No room arrangements added yet</p>
                          <p className="text-sm text-gray-400 mt-2">Click on "Add Room" above to add room arrangements</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Action Buttons for Hotel Selection */}
            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => navigate("/quotes")}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleStageChange('quote-details')} 
                disabled={!isHotelSelectionComplete()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Continue to Quote Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quote Details Stage */}
      {editorStage === 'quote-details' && (
        <>
          {/* Tabs for Edit and Summary Views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="edit" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800">
                Edit Quote
              </TabsTrigger>
              <TabsTrigger value="summary" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800">
                Quote Summary
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="mt-6 space-y-6">
              {/* Hotel Cards - One for each selected hotel */}
              {selectedHotelObjects.map(hotel => (
                <Card key={hotel.id}>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Hotel className="h-5 w-5 text-teal-600" />
                    <CardTitle>{hotel.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Room Arrangements for this hotel */}
                    <div>
                      <h3 className="text-md font-medium mb-4">Room Arrangements</h3>
                      <RoomArrangementSection 
                        roomArrangements={quote.roomArrangements.filter(arr => arr.hotelId === hotel.id)}
                        duration={quote.duration.nights}
                        onRoomArrangementsChange={(arrangements) => {
                          // Preserve arrangements for other hotels
                          const otherHotelsArrangements = quote.roomArrangements.filter(arr => arr.hotelId !== hotel.id);
                          handleRoomArrangementsChange([...otherHotelsArrangements, ...arrangements]);
                        }}
                        availableRoomTypes={hotel.roomTypes?.map((rt: any) => rt.name) || ["Standard Room", "Deluxe Room", "Suite"]}
                        hotelId={hotel.id}
                      />
                    </div>
                    
                    {/* Activities for this hotel */}
                    <div>
                      <h3 className="text-md font-medium mb-4">Hotel Activities</h3>
                      <div className="text-center py-6 border border-dashed border-gray-200 rounded-md">
                        <p className="text-gray-500">Activities will be configured here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Transfer Section */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <CardTitle>Transfer</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransferSection 
                    transfers={quote.transfers || []} 
                    onTransfersChange={handleTransfersChange}
                  />
                </CardContent>
              </Card>
              
              {/* Transportation Section */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Bus className="h-5 w-5 text-teal-600" />
                  <CardTitle>Transportation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 border border-dashed border-gray-200 rounded-md">
                    <p className="text-gray-500">Transportation options will be configured here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="summary" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuoteSummary quote={quote} hotels={selectedHotelObjects} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Action Buttons */}
          <QuoteActionButtons
            saving={saving}
            handleSave={handleSave}
            onCancel={() => navigate("/quotes")}
          />
        </>
      )}
    </div>
  );
};

export default EditQuote;
