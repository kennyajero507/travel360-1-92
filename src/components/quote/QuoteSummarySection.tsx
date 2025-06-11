
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { quoteSummaryService, quoteMarkupService } from '../../services/normalizedQuoteService';
import { Calculator, Users, DollarSign } from 'lucide-react';
import { QuoteSummaryData } from '../../types/quoteSummary.types';

interface QuoteSummarySectionProps {
  quoteId: string;
  userRole?: string;
}

const QuoteSummarySection: React.FC<QuoteSummarySectionProps> = ({ 
  quoteId, 
  userRole = 'agent' 
}) => {
  const { data: summary } = useQuery({
    queryKey: ['quote-summary', quoteId],
    queryFn: () => quoteSummaryService.getCalculatedSummary(quoteId),
    enabled: !!quoteId,
    refetchInterval: 5000 // Refresh every 5 seconds to show updated calculations
  });

  const { data: markup } = useQuery({
    queryKey: ['quote-markup', quoteId],
    queryFn: () => quoteMarkupService.getByQuoteId(quoteId),
    enabled: !!quoteId
  });

  // Show summary only to agents and above
  if (userRole === 'client') {
    return null;
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Quote Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Add items to see quote calculation...</p>
        </CardContent>
      </Card>
    );
  }

  // Type guard and validation for summary data
  const isValidSummaryData = (data: any): data is QuoteSummaryData => {
    return data && 
           typeof data === 'object' && 
           typeof data.number_of_adults === 'number' &&
           typeof data.accommodation_cost === 'number' &&
           typeof data.total_cost === 'number';
  };

  if (!isValidSummaryData(summary)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Quote Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Invalid summary data format</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Quote Summary - Agent View
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Traveler Count */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <Users className="h-5 w-5 text-gray-600" />
          <div className="flex gap-4 text-sm">
            <Badge variant="outline">{summary.number_of_adults} Adults</Badge>
            <Badge variant="outline">{summary.number_of_children} Children</Badge>
            <Badge variant="outline">{summary.number_of_infants} Infants</Badge>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>🏨 Accommodation:</span>
              <span className="font-medium">{formatCurrency(summary.accommodation_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span>🚗 Transport:</span>
              <span className="font-medium">{formatCurrency(summary.transport_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span>🚐 Transfers:</span>
              <span className="font-medium">{formatCurrency(summary.transfer_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span>🏞️ Excursions:</span>
              <span className="font-medium">{formatCurrency(summary.excursion_cost)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Net Cost:</span>
              <span className="font-medium">{formatCurrency(summary.net_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Markup ({summary.markup_percentage}%):</span>
              <span className="font-medium text-green-600">
                +{formatCurrency(summary.markup_cost)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total Cost:</span>
              <span className="text-blue-600">{formatCurrency(summary.total_cost)}</span>
            </div>
          </div>
        </div>

        {/* Markup Notes */}
        {markup?.notes && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Markup Notes:</strong> {markup.notes}
            </p>
          </div>
        )}

        {/* Per Person Cost */}
        {summary.number_of_adults > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 font-medium">Cost per Adult:</span>
            </div>
            <span className="text-blue-800 font-bold">
              {formatCurrency(summary.total_cost / summary.number_of_adults)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteSummarySection;
