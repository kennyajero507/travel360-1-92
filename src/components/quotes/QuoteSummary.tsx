import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calculator } from 'lucide-react';
import { formatCurrency, calculateTotals } from '../../utils/quoteCalculations';
import type { SleepingArrangement, TransportOption, TransferOption, Activity } from '../../types/quote';

interface QuoteSummaryProps {
  sleepingArrangements: SleepingArrangement[];
  transportOptions: TransportOption[];
  transferOptions: TransferOption[];
  activities: Activity[];
  markupPercentage: number;
  durationNights: number;
  currencyCode: string;
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  sleepingArrangements,
  transportOptions,
  transferOptions,
  activities,
  markupPercentage,
  durationNights,
  currencyCode
}) => {
  // Ensure all arrays are properly defined
  const safeArrangements = Array.isArray(sleepingArrangements) ? sleepingArrangements : [];
  const safeTransportOptions = Array.isArray(transportOptions) ? transportOptions : [];
  const safeTransferOptions = Array.isArray(transferOptions) ? transferOptions : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  const totals = calculateTotals(
    safeArrangements,
    safeTransportOptions,
    safeTransferOptions,
    safeActivities,
    markupPercentage,
    durationNights
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Quote Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {totals.accommodationTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Accommodation</span>
              <span className="font-medium">{formatCurrency(totals.accommodationTotal, currencyCode)}</span>
            </div>
          )}
          
          {totals.transportTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Transport</span>
              <span className="font-medium">{formatCurrency(totals.transportTotal, currencyCode)}</span>
            </div>
          )}
          
          {totals.transferTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Transfers</span>
              <span className="font-medium">{formatCurrency(totals.transferTotal, currencyCode)}</span>
            </div>
          )}
          
          {totals.activityTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Activities</span>
              <span className="font-medium">{formatCurrency(totals.activityTotal, currencyCode)}</span>
            </div>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(totals.subtotal, currencyCode)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Markup ({markupPercentage}%)</span>
              <span className="font-medium text-blue-600">{formatCurrency(totals.markupAmount, currencyCode)}</span>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">{formatCurrency(totals.grandTotal, currencyCode)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteSummary;