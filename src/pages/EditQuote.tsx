
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
import ClientDetailsCard from "../components/quote/ClientDetailsCard";
import HotelSelection from "../components/quote/HotelSelection";
import AccommodationSection from "../components/quote/AccommodationSection";
import TransportBookingSection from "../components/quote/TransportBookingSection";
import TransferSection from "../components/quote/TransferSection";
import ExcursionSection from "../components/quote/ExcursionSection";
import MarkupManagementSection from "../components/quote/MarkupManagementSection";
import QuoteSummary from "../components/quote/QuoteSummary";

import { Hotel, Bus, MapPin, Compass, FileText, X, Calculator, TrendingUp } from "lucide-react";

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
  
  const [selectedHotelObjects, setSelectedHotelObjects] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string>("accommodation");
  const [transports, setTransports] = useState<any[]>([]);
  const [excursions, setExcursions] = useState<any[]>([]);
  const [sectionMarkups, setSectionMarkups] = useState<Record<string, any>>({});
  
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

  // Calculate section totals
  const accommodationTotal = quote?.room_arrangements?.reduce((sum, arr) => sum + (arr.total || 0), 0) || 0;
  const transportTotal = transports.reduce((sum, transport) => sum + (transport.total_cost || 0), 0);
  const transferTotal = quote?.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
  const excursionTotal = excursions.reduce((sum, excursion) => sum + (excursion.total_cost || 0), 0);

  const handleRoomTypesLoaded = (roomTypes: any[]) => {
    if (quote && roomTypes.length > 0) {
      populateRoomArrangementsFromHotel(roomTypes, quote.duration_nights);
    }
  };

  const handleMarkupChange = (section: string, markup: any) => {
    setSectionMarkups(prev => ({
      ...prev,
      [section]: markup
    }));
  };

  // Calculate completion percentage
  const calculateProgress = () => {
    let completedSections = 0;
    const totalSections = 6;
    
    if (selectedHotelObjects.length > 0 && accommodationTotal > 0) completedSections++;
    if (transportTotal > 0) completedSections++;
    if (transferTotal > 0) completedSections++;
    if (excursionTotal > 0) completedSections++;
    if (Object.keys(sectionMarkups).length > 0) completedSections++;
    if (accommodationTotal > 0 || transportTotal > 0 || transferTotal > 0 || excursionTotal > 0) completedSections++; // Summary
    
    return (completedSections / totalSections) * 100;
  };

  const sections = [
    { id: 'accommodation', label: 'Accommodation', icon: Hotel, completed: selectedHotelObjects.length > 0 && accommodationTotal > 0 },
    { id: 'transport', label: 'Transport Booking', icon: Bus, completed: transportTotal > 0 },
    { id: 'transfer', label: 'Transfer', icon: MapPin, completed: transferTotal > 0 },
    { id: 'excursion', label: 'Quote Excursion', icon: Compass, completed: excursionTotal > 0 },
    { id: 'markup', label: 'Quote Markup', icon: Calculator, completed: Object.keys(sectionMarkups).length > 0 },
    { id: 'summary', label: 'Summary', icon: FileText, completed: true }
  ];

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
      
      {/* Client Details Card */}
      <ClientDetailsCard
        client={quote.client}
        mobile={quote.mobile}
        destination={quote.destination}
        startDate={quote.start_date}
        endDate={quote.end_date}
        duration={{
          days: quote.duration_days,
          nights: quote.duration_nights
        }}
        status={quote.status}
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
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {sections.map(section => (
              <span key={section.id} className={section.completed ? 'text-green-600' : ''}>
                {section.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6-Section Quote Builder */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
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
          {/* Hotel Selection for Accommodation */}
          {selectedHotelObjects.length === 0 && (
            <Card className="mb-6 border border-blue-100">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-blue-600" />
                  Select Hotels First
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <HotelSelection
                  selectedHotelId={selectedHotelId}
                  hotels={hotels}
                  onHotelSelection={handleHotelSelection}
                  onRoomTypesLoaded={handleRoomTypesLoaded}
                  isRequired={true}
                  maxHotels={2}
                  selectedHotelsCount={selectedHotelObjects.length}
                />
              </CardContent>
            </Card>
          )}

          <TabsContent value="accommodation" className="mt-0">
            <AccommodationSection
              selectedHotels={selectedHotelObjects}
              roomArrangements={quote.room_arrangements || []}
              onRoomArrangementsChange={handleRoomArrangementsChange}
              availableRoomTypes={["Standard Room", "Deluxe Room", "Suite", "Family Room"]}
              duration={quote.duration_nights}
            />
          </TabsContent>
          
          <TabsContent value="transport" className="mt-0">
            <TransportBookingSection
              transports={transports}
              onTransportsChange={setTransports}
            />
          </TabsContent>
          
          <TabsContent value="transfer" className="mt-0">
            <TransferSection 
              transfers={quote.transfers || []} 
              onTransfersChange={handleTransfersChange}
            />
          </TabsContent>
          
          <TabsContent value="excursion" className="mt-0">
            <ExcursionSection
              excursions={excursions}
              onExcursionsChange={setExcursions}
            />
          </TabsContent>
          
          <TabsContent value="markup" className="mt-0">
            <MarkupManagementSection
              accommodationTotal={accommodationTotal}
              transportTotal={transportTotal}
              transferTotal={transferTotal}
              excursionTotal={excursionTotal}
              onMarkupChange={handleMarkupChange}
            />
          </TabsContent>
          
          <TabsContent value="summary" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteSummary 
                  quote={{
                    ...quote,
                    transports,
                    excursions,
                    sectionMarkups
                  }} 
                  hotels={selectedHotelObjects} 
                />
              </CardContent>
            </Card>
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
  );
};

export default EditQuote;
