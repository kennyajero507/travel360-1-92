
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
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
  Download,
  Settings
} from "lucide-react";
import { QuoteData } from "../../types/quote.types";
import CurrencyDisplay from "./CurrencyDisplay";
import HotelComparisonToggle from "./HotelComparisonToggle";

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
  const [isComparisonMode, setIsComparisonMode] = useState(selectedHotels.length > 1);

  const currencies = [
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'TZS', name: 'Tanzanian Shilling' },
    { code: 'UGX', name: 'Ugandan Shilling' }
  ];

  const handleCurrencyChange = (newCurrency: string) => {
    onQuoteUpdate({
      ...quote,
      currency_code: newCurrency,
      preferred_currency: newCurrency
    });
  };

  const handleComparisonToggle = (enabled: boolean) => {
    setIsComparisonMode(enabled);
    // Additional logic can be added here for comparison mode
  };

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Scroll the specific section into view
    const element = document.querySelector(`[data-section="${value}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
        <CardContent className="space-y-4">
          {/* Currency and Comparison Settings */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <Label htmlFor="currency">Quote Currency</Label>
              <Select value={quote.currency_code || 'KES'} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-64">
              <HotelComparisonToggle
                isComparisonMode={isComparisonMode}
                onToggle={handleComparisonToggle}
              />
            </div>
          </div>

          {/* Progress Bar */}
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
                onClick={() => handleTabChange(getNextIncompleteSection())}
              >
                Continue with {sections.find(s => s.id === getNextIncompleteSection())?.label}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Builder Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
      </Tabs>

      {/* Section Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4 text-center">
            <Hotel className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Accommodation</p>
            <p className="text-lg font-semibold text-blue-600">
              <CurrencyDisplay amount={accommodationTotal} currencyCode={quote.currency_code} />
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4 text-center">
            <Bus className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-600">Transport</p>
            <p className="text-lg font-semibold text-green-600">
              <CurrencyDisplay amount={transportTotal} currencyCode={quote.currency_code} />
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-gray-600">Transfers</p>
            <p className="text-lg font-semibold text-purple-600">
              <CurrencyDisplay amount={transferTotal} currencyCode={quote.currency_code} />
            </p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-4 text-center">
            <Compass className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <p className="text-sm text-gray-600">Activities</p>
            <p className="text-lg font-semibold text-orange-600">
              <CurrencyDisplay amount={excursionTotal} currencyCode={quote.currency_code} />
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuoteBuilder;
