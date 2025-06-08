
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import MarkupCalculator from "./MarkupCalculator";

interface MarkupItem {
  section: string;
  basePrice: number;
  markupPercentage: number;
  markupAmount: number;
  finalPrice: number;
}

interface MarkupManagementSectionProps {
  accommodationTotal: number;
  transportTotal: number;
  transferTotal: number;
  excursionTotal: number;
  onMarkupChange: (section: string, markup: any) => void;
}

const MarkupManagementSection: React.FC<MarkupManagementSectionProps> = ({
  accommodationTotal,
  transportTotal,
  transferTotal,
  excursionTotal,
  onMarkupChange
}) => {
  const [markups, setMarkups] = useState<Record<string, MarkupItem>>({
    accommodation: {
      section: 'Accommodation',
      basePrice: accommodationTotal,
      markupPercentage: 15,
      markupAmount: 0,
      finalPrice: 0
    },
    transport: {
      section: 'Transport',
      basePrice: transportTotal,
      markupPercentage: 10,
      markupAmount: 0,
      finalPrice: 0
    },
    transfer: {
      section: 'Transfer',
      basePrice: transferTotal,
      markupPercentage: 20,
      markupAmount: 0,
      finalPrice: 0
    },
    excursion: {
      section: 'Excursion',
      basePrice: excursionTotal,
      markupPercentage: 25,
      markupAmount: 0,
      finalPrice: 0
    }
  });

  const handleMarkupChange = (section: string, calculation: any) => {
    setMarkups(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        basePrice: calculation.basePrice,
        markupPercentage: calculation.markupPercentage,
        markupAmount: calculation.markupAmount,
        finalPrice: calculation.finalPrice
      }
    }));
    
    onMarkupChange(section, calculation);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalBasePrice = Object.values(markups).reduce((sum, item) => sum + item.basePrice, 0);
  const totalMarkupAmount = Object.values(markups).reduce((sum, item) => sum + item.markupAmount, 0);
  const totalFinalPrice = Object.values(markups).reduce((sum, item) => sum + item.finalPrice, 0);
  const overallMarkupPercentage = totalBasePrice > 0 ? (totalMarkupAmount / totalBasePrice) * 100 : 0;

  const sections = [
    { key: 'accommodation', basePrice: accommodationTotal, icon: '🏨' },
    { key: 'transport', basePrice: transportTotal, icon: '✈️' },
    { key: 'transfer', basePrice: transferTotal, icon: '🚗' },
    { key: 'excursion', basePrice: excursionTotal, icon: '🗺️' }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Calculator className="h-5 w-5 text-orange-600" />
        <CardTitle>Quote Markup Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Individual Section Markups */}
        <div className="grid gap-6">
          {sections.map(({ key, basePrice, icon }) => (
            <div key={key}>
              {basePrice > 0 && (
                <MarkupCalculator
                  basePrice={basePrice}
                  initialMarkup={markups[key]?.markupPercentage || 15}
                  onMarkupChange={(calculation) => handleMarkupChange(key, calculation)}
                  label={`${icon} ${markups[key]?.section || key}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Total Summary */}
        {totalBasePrice > 0 && (
          <div className="border-t pt-6">
            <Card className="border border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Total Quote Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Base Price</div>
                    <div className="text-xl font-semibold text-gray-800">
                      {formatCurrency(totalBasePrice)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Total Markup</div>
                    <div className="text-xl font-semibold text-orange-600">
                      +{formatCurrency(totalMarkupAmount)}
                    </div>
                    <Badge variant="outline" className="text-orange-600 mt-1">
                      {overallMarkupPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Final Price</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalFinalPrice)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Profit Margin</div>
                    <div className="text-xl font-semibold text-blue-600">
                      {formatCurrency(totalMarkupAmount)}
                    </div>
                  </div>
                </div>

                {/* Breakdown by Section */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Markup Breakdown</h4>
                  <div className="space-y-2">
                    {sections
                      .filter(({ basePrice }) => basePrice > 0)
                      .map(({ key, icon }) => {
                        const markup = markups[key];
                        return (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{icon}</span>
                              <span className="font-medium">{markup.section}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                {formatCurrency(markup.basePrice)}
                              </span>
                              <Badge variant="outline" className="text-orange-600">
                                +{markup.markupPercentage.toFixed(1)}%
                              </Badge>
                              <span className="font-semibold text-green-600 min-w-[80px] text-right">
                                {formatCurrency(markup.finalPrice)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {totalBasePrice === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pricing data available yet</p>
            <p className="text-sm text-gray-400">Add accommodation, transport, transfers, or excursions to calculate markups</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarkupManagementSection;
