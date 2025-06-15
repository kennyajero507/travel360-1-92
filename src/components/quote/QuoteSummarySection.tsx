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
    refetchInterval: 5000
  });

  const { data: markup } = useQuery({
    queryKey: ['quote-markup', quoteId],
    queryFn: () => quoteMarkupService.getByQuoteId(quoteId),
    enabled: !!quoteId
  });

  if (userRole === 'client') return null;
  if (!summary || typeof summary !== 'object') {
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

  // Assume summary is any shape
  const s: any = summary;
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
            <Badge variant="outline">{s.number_of_adults ?? 0} Adults</Badge>
            <Badge variant="outline">{s.number_of_children ?? 0} Children</Badge>
            <Badge variant="outline">{s.number_of_infants ?? 0} Infants</Badge>
          </div>
        </div>
        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>🏨 Accommodation:</span>
              <span className="font-medium">{formatCurrency(s.accommodation_cost ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>🚗 Transport:</span>
              <span className="font-medium">{formatCurrency(s.transport_cost ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>🚐 Transfers:</span>
              <span className="font-medium">{formatCurrency(s.transfer_cost ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>🏞️ Excursions:</span>
              <span className="font-medium">{formatCurrency(s.excursion_cost ?? 0)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Net Cost:</span>
              <span className="font-medium">{formatCurrency(s.net_cost ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Markup ({s.markup_percentage ?? 0}%):</span>
              <span className="font-medium text-green-600">
                +{formatCurrency(s.markup_cost ?? 0)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total Cost:</span>
              <span className="text-blue-600">{formatCurrency(s.total_cost ?? 0)}</span>
            </div>
          </div>
        </div>
        {/* Markup Notes */}
        {markup && typeof markup === 'object' && 'notes' in markup && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Markup Notes:</strong> {(markup as any).notes}
            </p>
          </div>
        )}
        {/* Per Person Cost */}
        {(s.number_of_adults ?? 0) > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 font-medium">Cost per Adult:</span>
            </div>
            <span className="text-blue-800 font-bold">
              {formatCurrency((s.total_cost ?? 0) / (s.number_of_adults ?? 1))}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteSummarySection;
