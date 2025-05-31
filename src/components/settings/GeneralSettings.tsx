
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCurrency } from "../../contexts/CurrencyContext";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const GeneralSettings = () => {
  const { currency, setCurrency, currencies } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");

  const handleCurrencyChange = (code: string) => {
    const selectedCurrency = currencies.find(c => c.code === code);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
      toast.success(`Currency changed to ${selectedCurrency.name}`);
    }
  };

  const filteredCurrencies = currencies.filter(curr =>
    curr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curr.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currencySearch">Search Currency</Label>
              <Input
                id="currencySearch"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            <div>
              <Label className="font-medium">Default Currency</Label>
              <Select value={currency.code} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-full md:w-72">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredCurrencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.symbol} - {curr.code} ({curr.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-2">
                This currency will be used as default for all quotes and invoices.
              </p>
            </div>
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
