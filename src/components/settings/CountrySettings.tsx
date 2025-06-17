
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCountry } from "../../contexts/CountryContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import { toast } from "sonner";

const CountrySettings = () => {
  const { country, setCountry, getCurrencyForCountry } = useCountry();
  const { setCurrency, currencies } = useCurrency();

  const countries = [
    { code: 'Kenya', name: 'Kenya' },
    { code: 'Tanzania', name: 'Tanzania' },
    { code: 'Uganda', name: 'Uganda' },
    { code: 'Rwanda', name: 'Rwanda' },
    { code: 'Ethiopia', name: 'Ethiopia' }
  ];

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    
    // Auto-update currency based on country
    const countryCurrency = getCurrencyForCountry(selectedCountry);
    const currencyObj = currencies.find(c => c.code === countryCurrency);
    if (currencyObj) {
      setCurrency(currencyObj);
    }
    
    toast.success(`Country changed to ${selectedCountry}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Country & Regional Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="country">Default Country</Label>
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-full md:w-72">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-2">
            This will set the default country for all tours, regions, and currency preferences.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountrySettings;
