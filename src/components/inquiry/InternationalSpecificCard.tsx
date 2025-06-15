
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { InquiryFormProps } from "../../types/inquiry.types";

export const InternationalSpecificCard = ({ formData, setFormData, validationErrors }: InquiryFormProps) => {
  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'INR', label: 'Indian Rupee (INR)' },
    { value: 'AED', label: 'UAE Dirham (AED)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' }
  ];

  const flightPreferences = [
    { value: 'direct', label: 'Direct Flights Only' },
    { value: 'connecting', label: 'Connecting Flights OK' },
    { value: 'economy', label: 'Economy Class' },
    { value: 'business', label: 'Business Class' },
    { value: 'first', label: 'First Class' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>International Tour Specifics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visa Requirements */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visa_required"
                checked={formData.visa_required}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, visa_required: !!checked })
                }
              />
              <Label htmlFor="visa_required">Visa Required</Label>
            </div>
          </div>

          {/* Travel Insurance */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="travel_insurance_required"
                checked={formData.travel_insurance_required}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, travel_insurance_required: !!checked })
                }
              />
              <Label htmlFor="travel_insurance_required">Travel Insurance Required</Label>
            </div>
          </div>

          {/* Passport Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="passport_expiry_date">Passport Expiry Date</Label>
            <Input
              id="passport_expiry_date"
              type="date"
              value={formData.passport_expiry_date}
              onChange={(e) =>
                setFormData({ ...formData, passport_expiry_date: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
            />
            {formData.passport_expiry_date && 
             new Date(formData.passport_expiry_date) < new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) && (
              <p className="text-sm text-orange-600">
                ⚠️ Passport expires within 6 months. Consider renewal.
              </p>
            )}
          </div>

          {/* Preferred Currency */}
          <div className="space-y-2">
            <Label htmlFor="preferred_currency">Preferred Currency</Label>
            <Select
              value={formData.preferred_currency}
              onValueChange={(value) =>
                setFormData({ ...formData, preferred_currency: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Flight Preference */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="flight_preference">Flight Preference</Label>
            <Select
              value={formData.flight_preference}
              onValueChange={(value) =>
                setFormData({ ...formData, flight_preference: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select flight preference" />
              </SelectTrigger>
              <SelectContent>
                {flightPreferences.map((pref) => (
                  <SelectItem key={pref.value} value={pref.value}>
                    {pref.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
