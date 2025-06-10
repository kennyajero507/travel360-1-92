
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useRole } from "../contexts/RoleContext";
import { useHotelsData } from "../hooks/useHotelsData";
import { useQuoteEditor } from "../hooks/useQuoteEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";

// Components
import LoadingIndicator from "../components/quote/LoadingIndicator";
import QuoteHeader from "../components/quote/QuoteHeader";
import ClientDetailsEditableSection from "../components/quote/ClientDetailsEditableSection";
import HotelSelectionSection from "../components/quote/HotelSelectionSection";
import AccommodationSection from "../components/quote/AccommodationSection";
import TransportBookingSection from "../components/quote/TransportBookingSection";
import TransferSection from "../components/quote/TransferSection";
import ExcursionSection from "../components/quote/ExcursionSection";
import MarkupManagementSection from "../components/quote/MarkupManagementSection";
import QuoteSummary from "../components/quote/QuoteSummary";

import { User, Hotel, Bus, MapPin, Compass, Calculator, FileText } from "lucide-react";

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
    handleRoomArrangementsChange,
    handleTransfersChange,
    handleTransportsChange,
    handleActivitiesChange,
    handleSave,
    previewQuote,
    downloadQuote,
    emailQuote,
    isHotelSelectionComplete
  } = useQuoteEditor(quoteId, role);
  
  const [selectedHotelObjects, setSelectedHotelObjects] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string>("client");
  
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

  // Calculate section totals using the enhanced quote calculations
  const accommodationTotal = quote?.room_arrangements?.reduce((sum, arr) => sum + (arr.total || 0), 0) || 0;
  const transportTotal = quote?.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
  const transferTotal = quote?.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
  const excursionTotal = quote?.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;

  const handleRoomTypesLoaded = (roomTypes: any[]) => {
    if (quote && roomTypes.length > 0) {
      populateRoomArrangementsFromHotel(roomTypes, quote.duration_nights);
    }
  };

  // Define sections for the new flow
  const sections = [
    { id: 'client', label: 'Client Details', icon: User, completed: !!quote?.client },
    { id: 'hotels', label: 'Hotel Selection', icon: Hotel, completed: selectedHotelObjects.length > 0 },
    { id: 'accommodation', label: 'Accommodation', icon: Hotel, completed: accommodationTotal > 0 },
    { id: 'transport', label: 'Transport', icon: Bus, completed: transportTotal > 0 },
    { id: 'transfer', label: 'Transfer', icon: MapPin, completed: transferTotal > 0 },
    { id: 'excursion', label: 'Excursion', icon: Compass, completed: excursionTotal > 0 },
    { id: 'markup', label: 'Markup & Summary', icon: Calculator, completed: true }
  ];

  // Calculate completion percentage
  const calculateProgress = () => {
    let completedSections = sections.filter(section => section.completed).length;
    return (completedSections / sections.length) * 100;
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
        createdAt={quote.created_at}
        saving={saving}
        handleSave={handleSave}
        previewQuote={previewQuote}
        emailQuote={emailQuote}
        downloadQuote={downloadQuote}
        isHotelSelectionRequired={!isHotelSelectionComplete()}
        disableSave={false}
        stage="quote-details"
        onStageChange={() => {}}
      />
      
      {/* Progress Indicator */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Quote Builder Progress</CardTitle>
            <Badge variant="outline">{Math.round(calculateProgress())}% Complete</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={calculateProgress()} className="w-full" />
        </CardContent>
      </Card>

      {/* New 7-Section Quote Builder */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {sections.map(section => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 relative"
            >
              <div className="flex items-center gap-1">
                <section.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
                {section.completed && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="mt-6">
          {/* 1. Client Details Section */}
          <TabsContent value="client" className="mt-0">
            <ClientDetailsEditableSection 
              quote={quote} 
              onQuoteUpdate={(updatedQuote) => {
                if (!quote) return;
                handleSave({...quote, ...updatedQuote});
              }} 
            />
          </TabsContent>

          {/* 2. Hotel Selection Section */}
          <TabsContent value="hotels" className="mt-0">
            <HotelSelectionSection
              selectedHotels={selectedHotelObjects}
              availableHotels={hotels}
              onHotelSelection={handleHotelSelection}
              onHotelRemove={removeSelectedHotel}
              onRoomTypesLoaded={handleRoomTypesLoaded}
            />
          </TabsContent>
          
          {/* 3. Accommodation Section */}
          <TabsContent value="accommodation" className="mt-0">
            <AccommodationSection
              selectedHotels={selectedHotelObjects}
              roomArrangements={quote.room_arrangements || []}
              onRoomArrangementsChange={handleRoomArrangementsChange}
              availableRoomTypes={["Standard Room", "Deluxe Room", "Suite", "Family Room"]}
              duration={quote.duration_nights}
            />
          </TabsContent>
          
          {/* 4. Transport Section */}
          <TabsContent value="transport" className="mt-0">
            <TransportBookingSection
              transports={quote.transports || []}
              onTransportsChange={handleTransportsChange}
            />
          </TabsContent>
          
          {/* 5. Transfer Section */}
          <TabsContent value="transfer" className="mt-0">
            <TransferSection 
              transfers={quote.transfers || []} 
              onTransfersChange={handleTransfersChange}
            />
          </TabsContent>
          
          {/* 6. Excursion Section */}
          <TabsContent value="excursion" className="mt-0">
            <ExcursionSection
              excursions={quote.activities || []}
              onExcursionsChange={handleActivitiesChange}
            />
          </TabsContent>
          
          {/* 7. Markup & Summary Section */}
          <TabsContent value="markup" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarkupManagementSection
                accommodationTotal={accommodationTotal}
                transportTotal={transportTotal}
                transferTotal={transferTotal}
                excursionTotal={excursionTotal}
                onMarkupChange={(type, value) => {
                  if (!quote) return;
                  handleSave({
                    ...quote,
                    markup_type: type,
                    markup_value: value
                  });
                }}
                markupType={quote.markup_type}
                markupValue={quote.markup_value}
              />
              
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuoteSummary quote={quote} hotels={selectedHotelObjects} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => navigate("/quotes")}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={() => handleSave()}
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
  );
};

export default EditQuote;
