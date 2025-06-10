
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Eye, Users, Settings } from "lucide-react";
import MultiHotelComparison from "./MultiHotelComparison";
import { ReverseMarkupCalculator, HotelComparisonData } from "../../utils/reverseMarkupCalculator";
import { QuoteData } from "../../types/quote.types";

interface QuoteComparisonViewProps {
  quote: QuoteData;
  selectedHotels: any[];
  onSelectHotel?: (hotelId: string) => void;
  markupPercentage?: number;
}

const QuoteComparisonView: React.FC<QuoteComparisonViewProps> = ({
  quote,
  selectedHotels,
  onSelectHotel,
  markupPercentage = 25
}) => {
  const [hotel1Data, setHotel1Data] = useState<HotelComparisonData | null>(null);
  const [hotel2Data, setHotel2Data] = useState<HotelComparisonData | null>(null);
  const [activeView, setActiveView] = useState<'agent' | 'client'>('agent');

  const totalTravelers = quote.adults + quote.children_with_bed + quote.children_no_bed + quote.infants;

  useEffect(() => {
    if (selectedHotels.length >= 2 && quote.room_arrangements) {
      // Calculate comparison data for hotel 1
      const hotel1Arrangements = quote.room_arrangements.filter(arr => arr.hotel_id === selectedHotels[0].id);
      const hotel1Transfers = quote.transfers?.filter(t => t.hotel_id === selectedHotels[0].id) || [];
      const hotel1Activities = quote.activities?.filter(a => a.hotel_id === selectedHotels[0].id) || [];

      const hotel1Comparison = ReverseMarkupCalculator.calculateHotelComparison(
        selectedHotels[0],
        hotel1Arrangements,
        hotel1Transfers,
        hotel1Activities,
        markupPercentage,
        totalTravelers
      );
      setHotel1Data(hotel1Comparison);

      // Calculate comparison data for hotel 2
      const hotel2Arrangements = quote.room_arrangements.filter(arr => arr.hotel_id === selectedHotels[1].id);
      const hotel2Transfers = quote.transfers?.filter(t => t.hotel_id === selectedHotels[1].id) || [];
      const hotel2Activities = quote.activities?.filter(a => a.hotel_id === selectedHotels[1].id) || [];

      const hotel2Comparison = ReverseMarkupCalculator.calculateHotelComparison(
        selectedHotels[1],
        hotel2Arrangements,
        hotel2Transfers,
        hotel2Activities,
        markupPercentage,
        totalTravelers
      );
      setHotel2Data(hotel2Comparison);
    }
  }, [selectedHotels, quote, markupPercentage, totalTravelers]);

  if (!hotel1Data || !hotel2Data) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">
            Please select 2 hotels and set up room arrangements to view comparison.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Switcher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Quote Preview Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'agent' | 'client')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="agent" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Agent View
              </TabsTrigger>
              <TabsTrigger value="client" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Client View
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {activeView === 'agent' ? (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Agent View Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full cost breakdown with base prices and markup</li>
                    <li>• Room arrangement details and capacity</li>
                    <li>• Transfer and activity cost breakdowns</li>
                    <li>• Price comparison and savings analysis</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Client View Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Clean, professional presentation</li>
                    <li>• Final prices only (no markup details)</li>
                    <li>• Simple hotel selection interface</li>
                    <li>• Clear call-to-action buttons</li>
                  </ul>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hotel Comparison */}
      <MultiHotelComparison
        hotel1Data={hotel1Data}
        hotel2Data={hotel2Data}
        viewMode={activeView}
        onSelectHotel={onSelectHotel}
        showComparison={activeView === 'agent'}
      />

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline">
            Save as Draft
          </Button>
          <Button variant="outline">
            Preview PDF
          </Button>
        </div>
        <div className="flex gap-2">
          {activeView === 'agent' && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              Send to Client
            </Button>
          )}
          <Button className="bg-green-600 hover:bg-green-700">
            Generate Final Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuoteComparisonView;
