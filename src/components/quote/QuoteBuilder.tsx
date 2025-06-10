
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { 
  User, 
  Hotel, 
  Bus, 
  MapPin, 
  Compass, 
  Calculator, 
  Eye,
  Save,
  Send,
  Download
} from "lucide-react";
import { QuoteData } from "../../types/quote.types";

interface QuoteBuilderProps {
  quote: QuoteData;
  hotels: any[];
  selectedHotels: any[];
  onQuoteUpdate: (updatedQuote: QuoteData) => void;
  onSave: () => Promise<void>;
  onPreview: () => void;
  onEmail: () => void;
  onDownload: () => void;
  saving?: boolean;
}

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  quote,
  hotels,
  selectedHotels,
  onQuoteUpdate,
  onSave,
  onPreview,
  onEmail,
  onDownload,
  saving = false
}) => {
  const [activeTab, setActiveTab] = useState("client");

  // Calculate completion progress
  const calculateProgress = () => {
    let completedSections = 0;
    const totalSections = 7;

    if (quote.client && quote.mobile && quote.destination) completedSections++;
    if (selectedHotels.length > 0) completedSections++;
    if (quote.room_arrangements && quote.room_arrangements.length > 0) completedSections++;
    if (quote.transports && quote.transports.length > 0) completedSections++;
    if (quote.transfers && quote.transfers.length > 0) completedSections++;
    if (quote.activities && quote.activities.length > 0) completedSections++;
    completedSections++; // Summary is always available

    return (completedSections / totalSections) * 100;
  };

  // Calculate section totals
  const accommodationTotal = quote.room_arrangements?.reduce((sum, arr) => sum + (arr.total || 0), 0) || 0;
  const transportTotal = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
  const transferTotal = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
  const excursionTotal = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;

  const sections = [
    { 
      id: 'client', 
      label: 'Client Details', 
      icon: User, 
      completed: !!(quote.client && quote.mobile && quote.destination),
      description: 'Basic client and trip information'
    },
    { 
      id: 'hotels', 
      label: 'Hotel Selection', 
      icon: Hotel, 
      completed: selectedHotels.length > 0,
      description: 'Choose hotels for comparison'
    },
    { 
      id: 'accommodation', 
      label: 'Accommodation', 
      icon: Hotel, 
      completed: accommodationTotal > 0,
      description: 'Room arrangements and pricing'
    },
    { 
      id: 'transport', 
      label: 'Transport', 
      icon: Bus, 
      completed: transportTotal > 0,
      description: 'Flight, train, and transport bookings'
    },
    { 
      id: 'transfer', 
      label: 'Transfers', 
      icon: MapPin, 
      completed: transferTotal > 0,
      description: 'Airport pickups and local transfers'
    },
    { 
      id: 'excursion', 
      label: 'Activities', 
      icon: Compass, 
      completed: excursionTotal > 0,
      description: 'Sightseeing and experiences'
    },
    { 
      id: 'summary', 
      label: 'Summary', 
      icon: Calculator, 
      completed: true,
      description: 'Pricing, markup, and final review'
    }
  ];

  const getNextIncompleteSection = () => {
    return sections.find(section => !section.completed)?.id || 'summary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Quote Builder</CardTitle>
              <p className="text-gray-600 mt-1">
                {quote.client ? `Quote for ${quote.client}` : 'Create a new quote'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onSave}
                disabled={saving}
                variant="outline"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={onPreview}
                variant="outline"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={onEmail}
                variant="outline"
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                onClick={onDownload}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <Badge variant="outline">{Math.round(calculateProgress())}% Complete</Badge>
          </div>
          <Progress value={calculateProgress()} className="w-full" />
          
          {calculateProgress() < 100 && (
            <div className="mt-2">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-blue-600"
                onClick={() => setActiveTab(getNextIncompleteSection())}
              >
                Continue with {sections.find(s => s.id === getNextIncompleteSection())?.label}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Builder Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {sections.map(section => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 relative"
              title={section.description}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <section.icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">{section.label}</span>
                </div>
                {section.completed && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="mt-6">
          {/* Tab contents will be rendered by parent component */}
          <TabsContent value={activeTab} className="mt-0">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {sections.find(s => s.id === activeTab)?.label} Section
                  </h3>
                  <p className="text-gray-600">
                    {sections.find(s => s.id === activeTab)?.description}
                  </p>
                  <p className="text-sm text-gray-400 mt-4">
                    This section will be populated by the specific components for {activeTab}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default QuoteBuilder;
