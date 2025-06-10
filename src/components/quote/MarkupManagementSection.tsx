
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Calculator, DollarSign, Percent } from "lucide-react";
import { useCurrency } from "../../contexts/CurrencyContext";

interface MarkupManagementSectionProps {
  accommodationTotal: number;
  transportTotal: number;
  transferTotal: number;
  excursionTotal: number;
  onMarkupChange: (type: string, value: number) => void;
  markupType?: string;
  markupValue?: number;
}

const MarkupManagementSection: React.FC<MarkupManagementSectionProps> = ({
  accommodationTotal,
  transportTotal,
  transferTotal,
  excursionTotal,
  onMarkupChange,
  markupType = "percentage",
  markupValue = 25
}) => {
  const { formatAmount } = useCurrency();
  const [markupSettings, setMarkupSettings] = useState({
    type: markupType,
    value: markupValue
  });

  const [isChanged, setIsChanged] = useState(false);

  // Update state if props change
  useEffect(() => {
    setMarkupSettings({
      type: markupType,
      value: markupValue
    });
  }, [markupType, markupValue]);

  const subtotal = accommodationTotal + transportTotal + transferTotal + excursionTotal;
  
  const calculateMarkupAmount = () => {
    if (markupSettings.type === "percentage") {
      return (subtotal * markupSettings.value) / 100;
    } else {
      return markupSettings.value;
    }
  };

  const handleTypeChange = (type: string) => {
    setMarkupSettings(prev => ({ ...prev, type }));
    setIsChanged(true);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setMarkupSettings(prev => ({ ...prev, value }));
    setIsChanged(true);
  };

  const handleApplyMarkup = () => {
    onMarkupChange(markupSettings.type, markupSettings.value);
    setIsChanged(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Quote Markup & Pricing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Section summaries */}
          <div className="space-y-2">
            <h3 className="font-medium">Section Totals</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Accommodation</span>
                <span>{formatAmount(accommodationTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Transport</span>
                <span>{formatAmount(transportTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Transfer</span>
                <span>{formatAmount(transferTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Excursion</span>
                <span>{formatAmount(excursionTotal)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>{formatAmount(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Markup settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Markup Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="markup-type">Markup Type</Label>
                <Select 
                  value={markupSettings.type} 
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger id="markup-type" className="w-full">
                    <SelectValue placeholder="Select markup type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="markup-value">
                  {markupSettings.type === "percentage" ? "Percentage" : "Fixed Amount"}
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {markupSettings.type === "percentage" ? (
                      <Percent className="h-4 w-4 text-gray-400" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <Input
                    id="markup-value"
                    type="number"
                    min="0"
                    step={markupSettings.type === "percentage" ? "0.1" : "1"}
                    value={markupSettings.value}
                    onChange={handleValueChange}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleApplyMarkup}
              disabled={!isChanged}
              className="w-full"
            >
              Apply Markup
            </Button>
          </div>

          {/* Final pricing */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Calculated Pricing</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatAmount(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>
                  Markup ({markupSettings.type === "percentage" ? `${markupSettings.value}%` : "Fixed"})
                </span>
                <span>{formatAmount(calculateMarkupAmount())}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Price</span>
                <span className="text-teal-600">
                  {formatAmount(subtotal + calculateMarkupAmount())}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Per Person</span>
                <span>
                  {formatAmount((subtotal + calculateMarkupAmount()) / Math.max(1, accommodationTotal > 0 ? 1 : 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkupManagementSection;
