
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCurrency } from "../../contexts/CurrencyContext";

const GeneralSettings = () => {
  const { currency, setCurrency, currencies } = useCurrency();

  const handleCurrencyChange = (code: string) => {
    const selectedCurrency = currencies.find(c => c.code === code);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
      toast.success(`Currency changed to ${selectedCurrency.name}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="font-medium">Default Currency</label>
            <Select value={currency.code} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="w-full md:w-72">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              This currency will be used as default for all quotes and invoices.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="font-medium mb-2 block">Date Format</label>
              <Select defaultValue="MM/DD/YYYY">
                <SelectTrigger className="w-full md:w-72">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
