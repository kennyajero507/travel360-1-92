
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { QuoteData } from '../../types/quote.types';
import { useMultiCurrency } from '../../hooks/useMultiCurrency';
import MultiCurrencySelector from './MultiCurrencySelector';
import { CheckCircle, Circle, Eye } from 'lucide-react';

interface QuoteComparisonViewProps {
  quotes: QuoteData[];
  onSelectQuote?: (quoteId: string) => void;
  onPreviewQuote?: (quoteId: string) => void;
  selectedQuoteId?: string;
  viewMode?: 'agent' | 'client';
}

const QuoteComparisonView: React.FC<QuoteComparisonViewProps> = ({
  quotes,
  onSelectQuote,
  onPreviewQuote,
  selectedQuoteId,
  viewMode = 'client'
}) => {
  const [displayCurrency, setDisplayCurrency] = useState('KES');
  
  const QuoteCard = ({ quote }: { quote: QuoteData }) => {
    const { convertedQuoteTotals, formatAmount } = useMultiCurrency(quote, displayCurrency);
    const isSelected = selectedQuoteId === quote.id;

    return (
      <Card className={`relative transition-all ${isSelected ? 'ring-2 ring-teal-500 bg-teal-50' : 'hover:shadow-md'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Option {quotes.indexOf(quote) + 1}
            </CardTitle>
            <div className="flex items-center gap-2">
              {viewMode === 'client' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectQuote?.(quote.id)}
                  className={isSelected ? 'bg-teal-100 border-teal-500' : ''}
                >
                  {isSelected ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreviewQuote?.(quote.id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
          <Badge variant={quote.status === 'approved' ? 'default' : 'secondary'}>
            {quote.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Duration:</span>
              <p className="font-medium">{quote.duration_nights} nights, {quote.duration_days} days</p>
            </div>
            <div>
              <span className="text-gray-600">Travelers:</span>
              <p className="font-medium">
                {quote.adults} adults
                {quote.children_with_bed > 0 && `, ${quote.children_with_bed} children`}
                {quote.infants > 0 && `, ${quote.infants} infants`}
              </p>
            </div>
          </div>

          {convertedQuoteTotals && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Accommodation:</span>
                <span>{formatAmount(convertedQuoteTotals.accommodation)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Transport:</span>
                <span>{formatAmount(convertedQuoteTotals.transport)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Activities:</span>
                <span>{formatAmount(convertedQuoteTotals.activity)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Transfers:</span>
                <span>{formatAmount(convertedQuoteTotals.transfer)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-teal-600">{formatAmount(convertedQuoteTotals.grandTotal)}</span>
              </div>
              <div className="text-center text-sm text-gray-600">
                Per person: {formatAmount(convertedQuoteTotals.grandTotal / (quote.adults + quote.children_with_bed + quote.children_no_bed))}
              </div>
            </div>
          )}

          {quote.notes && (
            <div className="text-sm">
              <span className="text-gray-600">Notes:</span>
              <p className="mt-1">{quote.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {viewMode === 'client' ? 'Select Your Preferred Option' : 'Quote Comparison'}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Display currency:</span>
          <MultiCurrencySelector
            selectedCurrency={displayCurrency}
            onCurrencyChange={setDisplayCurrency}
            className="w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.map((quote) => (
          <QuoteCard key={quote.id} quote={quote} />
        ))}
      </div>

      {viewMode === 'client' && selectedQuoteId && (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            You have selected Option {quotes.findIndex(q => q.id === selectedQuoteId) + 1}
          </p>
          <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
            Proceed to Booking
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuoteComparisonView;
