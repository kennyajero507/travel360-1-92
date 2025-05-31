
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

export const QuoteSettings = () => {
  const [settings, setSettings] = useState({
    defaultMarkup: 15,
    multiHotelComparison: true,
    termsAndConditions: '',
    activeCurrencies: ['USD', 'EUR', 'KES'],
    visibleCostElements: {
      room: true,
      transfer: true,
      activity: true,
      transport: true,
      meals: false,
    },
    pdfLayout: {
      showLogo: true,
      showHeader: true,
      showFooter: true,
      headerText: '',
      footerText: '',
    }
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'TZS', name: 'Tanzanian Shilling' },
    { code: 'UGX', name: 'Ugandan Shilling' },
  ];

  const handleSave = () => {
    toast.success("Quote settings saved successfully");
  };

  const toggleCurrency = (currencyCode: string) => {
    setSettings(prev => ({
      ...prev,
      activeCurrencies: prev.activeCurrencies.includes(currencyCode)
        ? prev.activeCurrencies.filter(c => c !== currencyCode)
        : [...prev.activeCurrencies, currencyCode]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Default Quote Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input
                id="defaultMarkup"
                type="number"
                min="0"
                max="100"
                value={settings.defaultMarkup}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultMarkup: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="multiHotel"
                checked={settings.multiHotelComparison}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, multiHotelComparison: checked }))}
              />
              <Label htmlFor="multiHotel">Enable Multi-Hotel Comparison</Label>
            </div>
          </div>
          
          <div>
            <Label htmlFor="terms">Default Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={settings.termsAndConditions}
              onChange={(e) => setSettings(prev => ({ ...prev, termsAndConditions: e.target.value }))}
              placeholder="Enter default terms and conditions for quotes..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visible Cost Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(settings.visibleCostElements).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      visibleCostElements: {
                        ...prev.visibleCostElements,
                        [key]: checked
                      }
                    }))
                  }
                />
                <Label htmlFor={key} className="capitalize">{key}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Currencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {currencies.map((currency) => (
              <div key={currency.code} className="flex items-center space-x-2">
                <Checkbox
                  id={currency.code}
                  checked={settings.activeCurrencies.includes(currency.code)}
                  onCheckedChange={() => toggleCurrency(currency.code)}
                />
                <Label htmlFor={currency.code}>{currency.code} - {currency.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PDF Layout Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="showLogo"
              checked={settings.pdfLayout.showLogo}
              onCheckedChange={(checked) => 
                setSettings(prev => ({
                  ...prev,
                  pdfLayout: { ...prev.pdfLayout, showLogo: checked }
                }))
              }
            />
            <Label htmlFor="showLogo">Show Logo in PDF</Label>
          </div>
          
          <div>
            <Label htmlFor="headerText">Header Text</Label>
            <Input
              id="headerText"
              value={settings.pdfLayout.headerText}
              onChange={(e) => 
                setSettings(prev => ({
                  ...prev,
                  pdfLayout: { ...prev.pdfLayout, headerText: e.target.value }
                }))
              }
              placeholder="Custom header text for quotes"
            />
          </div>
          
          <div>
            <Label htmlFor="footerText">Footer Text</Label>
            <Input
              id="footerText"
              value={settings.pdfLayout.footerText}
              onChange={(e) => 
                setSettings(prev => ({
                  ...prev,
                  pdfLayout: { ...prev.pdfLayout, footerText: e.target.value }
                }))
              }
              placeholder="Custom footer text for quotes"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Quote Settings
        </Button>
      </div>
    </div>
  );
};
