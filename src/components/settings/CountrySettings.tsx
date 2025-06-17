
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useOrganizationSettings } from "../../hooks/useOrganizationSettings";
import { useCurrency } from "../../contexts/CurrencyContext";
import { toast } from "sonner";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";

const CountrySettings = () => {
  const { settings, loading } = useOrganizationSettings();
  const { setCurrency, currencies } = useCurrency();
  const { profile } = useAuth();

  const countries = [
    { code: 'Kenya', name: 'Kenya' },
    { code: 'Tanzania', name: 'Tanzania' },
    { code: 'Uganda', name: 'Uganda' },
    { code: 'Rwanda', name: 'Rwanda' },
    { code: 'Ethiopia', name: 'Ethiopia' }
  ];

  const getCurrencyForCountry = (country: string) => {
    const currencyMap: Record<string, string> = {
      'Kenya': 'KES',
      'Tanzania': 'TZS',
      'Uganda': 'UGX',
      'Rwanda': 'RWF',
      'Ethiopia': 'ETB'
    };
    return currencyMap[country] || 'KES';
  };

  const handleCountryChange = async (selectedCountry: string) => {
    if (!profile?.org_id) {
      toast.error('Organization not found');
      return;
    }

    try {
      // Get currency for the selected country
      const countryCurrency = getCurrencyForCountry(selectedCountry);
      
      // Update organization settings
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          org_id: profile.org_id,
          default_country: selectedCountry,
          default_currency: countryCurrency,
          default_regions: getRegionsForCountry(selectedCountry)
        });

      if (error) throw error;

      // Auto-update currency based on country
      const currencyObj = currencies.find(c => c.code === countryCurrency);
      if (currencyObj) {
        setCurrency(currencyObj);
      }
      
      toast.success(`Country changed to ${selectedCountry}`);
      
      // Refresh the page to update all components
      window.location.reload();
    } catch (error) {
      console.error('Error updating country settings:', error);
      toast.error('Failed to update country settings');
    }
  };

  const getRegionsForCountry = (country: string): string[] => {
    const regionMap: Record<string, string[]> = {
      'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega'],
      'Tanzania': ['Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar', 'Kilimanjaro'],
      'Uganda': ['Kampala', 'Entebbe', 'Jinja', 'Gulu', 'Mbarara'],
      'Rwanda': ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri'],
      'Ethiopia': ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Awassa']
    };
    return regionMap[country] || regionMap.Kenya;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Country & Regional Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 h-10 w-72 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Country & Regional Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="country">Default Country</Label>
          <Select 
            value={settings?.default_country || 'Kenya'} 
            onValueChange={handleCountryChange}
          >
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
