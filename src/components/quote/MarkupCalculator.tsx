
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Calculator, DollarSign } from "lucide-react";
import { markupService, MarkupCalculation } from "../../services/markupService";

interface MarkupCalculatorProps {
  basePrice: number;
  initialMarkup?: number;
  onMarkupChange: (calculation: MarkupCalculation) => void;
  currency?: string;
  label?: string;
}

const MarkupCalculator: React.FC<MarkupCalculatorProps> = ({
  basePrice,
  initialMarkup = 25,
  onMarkupChange,
  currency = 'USD',
  label = 'Hotel Option'
}) => {
  const [markupPercentage, setMarkupPercentage] = useState(initialMarkup);
  const [calculation, setCalculation] = useState<MarkupCalculation | null>(null);

  useEffect(() => {
    if (basePrice > 0) {
      const calc = markupService.calculateWithMarkup(basePrice, markupPercentage);
      setCalculation(calc);
      onMarkupChange(calc);
    }
  }, [basePrice, markupPercentage, onMarkupChange]);

  const handleMarkupChange = (value: string) => {
    const percentage = parseFloat(value) || 0;
    setMarkupPercentage(Math.max(0, Math.min(100, percentage))); // Clamp between 0-100%
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Card className="border border-green-100">
      <CardHeader className="bg-green-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-green-600" />
          Markup Calculator - {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="markup">Markup Percentage</Label>
            <div className="relative">
              <Input
                id="markup"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={markupPercentage}
                onChange={(e) => handleMarkupChange(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
          <div>
            <Label>Base Price</Label>
            <div className="flex items-center gap-2 mt-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{formatCurrency(basePrice)}</span>
            </div>
          </div>
        </div>

        {calculation && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Markup Amount:</span>
              <Badge variant="outline" className="text-orange-600">
                +{formatCurrency(calculation.markupAmount)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Final Price:</span>
              <Badge className="bg-green-600 text-white text-base px-3 py-1">
                {formatCurrency(calculation.finalPrice)}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarkupCalculator;
