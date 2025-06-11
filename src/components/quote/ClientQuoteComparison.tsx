
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, Star, Users, Calendar, MapPin } from 'lucide-react';
import { QuoteData } from '../../types/quote.types';

interface ClientQuoteComparisonProps {
  quotes: QuoteData[];
  onQuoteSelect: (quoteId: string) => void;
  selectedQuoteId?: string;
}

const ClientQuoteComparison: React.FC<ClientQuoteComparisonProps> = ({
  quotes,
  onQuoteSelect,
  selectedQuoteId
}) => {
  const [hoveredQuote, setHoveredQuote] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalCost = (quote: QuoteData) => {
    if (quote.summary_data && typeof quote.summary_data === 'object') {
      return (quote.summary_data as any).total_cost || 0;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Perfect Package</h2>
        <p className="text-gray-600 mt-2">Compare our carefully crafted options and select the one that suits you best</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.map((quote, index) => {
          const totalCost = getTotalCost(quote);
          const isSelected = selectedQuoteId === quote.id;
          const isHovered = hoveredQuote === quote.id;
          
          return (
            <Card
              key={quote.id}
              className={`relative transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : isHovered 
                    ? 'shadow-md transform -translate-y-1' 
                    : 'shadow-sm'
              }`}
              onMouseEnter={() => setHoveredQuote(quote.id)}
              onMouseLeave={() => setHoveredQuote(null)}
              onClick={() => onQuoteSelect(quote.id)}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Option {index + 1}</CardTitle>
                  <Badge variant={index === 1 ? 'default' : 'secondary'}>
                    {index === 0 ? 'Value' : index === 1 ? 'Premium' : 'Luxury'}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalCost)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(totalCost / (quote.adults || 1))} per person
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{quote.destination}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{quote.duration_nights} nights, {quote.duration_days} days</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>
                    {quote.adults} Adults
                    {quote.children_with_bed > 0 && `, ${quote.children_with_bed} Children`}
                    {quote.infants > 0 && `, ${quote.infants} Infants`}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">What's Included:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Accommodation ({quote.room_arrangements?.length || 0} rooms)</li>
                    <li>✓ Transport arrangements</li>
                    <li>✓ Airport transfers</li>
                    {quote.activities && quote.activities.length > 0 && (
                      <li>✓ {quote.activities.length} activities & excursions</li>
                    )}
                    <li>✓ 24/7 support</li>
                  </ul>
                </div>

                <Button
                  className={`w-full ${
                    isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuoteSelect(quote.id);
                  }}
                >
                  {isSelected ? 'Selected' : 'Select This Package'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedQuoteId && (
        <div className="text-center">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">
                Great choice! Your selected package is ready for booking.
              </p>
              <p className="text-green-600 text-sm mt-1">
                We'll be in touch shortly to finalize the details.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientQuoteComparison;
