
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { InquiryFormProps } from "../../types/inquiry.types";
import { useOrganizationSettings } from "../../hooks/useOrganizationSettings";

export const EnhancedFieldsCard = ({ formData, setFormData, validationErrors }: InquiryFormProps) => {
  const { settings } = useOrganizationSettings();
  const currency = settings?.default_currency || 'KES';
  
  const getBudgetRanges = (currencyCode: string) => {
    const ranges = {
      KES: [
        { value: 'budget', label: 'Budget (Under KSh 50,000)' },
        { value: 'standard', label: 'Standard (KSh 50,000 - KSh 150,000)' },
        { value: 'premium', label: 'Premium (KSh 150,000 - KSh 300,000)' },
        { value: 'luxury', label: 'Luxury (KSh 300,000 - KSh 500,000)' },
        { value: 'ultra_luxury', label: 'Ultra Luxury (Above KSh 500,000)' },
        { value: 'custom', label: 'Custom Budget Range' }
      ],
      USD: [
        { value: 'budget', label: 'Budget (Under $500)' },
        { value: 'standard', label: 'Standard ($500 - $1,500)' },
        { value: 'premium', label: 'Premium ($1,500 - $3,000)' },
        { value: 'luxury', label: 'Luxury ($3,000 - $5,000)' },
        { value: 'ultra_luxury', label: 'Ultra Luxury (Above $5,000)' },
        { value: 'custom', label: 'Custom Budget Range' }
      ],
      TZS: [
        { value: 'budget', label: 'Budget (Under TSh 1,200,000)' },
        { value: 'standard', label: 'Standard (TSh 1,200,000 - TSh 3,600,000)' },
        { value: 'premium', label: 'Premium (TSh 3,600,000 - TSh 7,200,000)' },
        { value: 'luxury', label: 'Luxury (TSh 7,200,000 - TSh 12,000,000)' },
        { value: 'ultra_luxury', label: 'Ultra Luxury (Above TSh 12,000,000)' },
        { value: 'custom', label: 'Custom Budget Range' }
      ],
      UGX: [
        { value: 'budget', label: 'Budget (Under USh 1,900,000)' },
        { value: 'standard', label: 'Standard (USh 1,900,000 - USh 5,700,000)' },
        { value: 'premium', label: 'Premium (USh 5,700,000 - USh 11,400,000)' },
        { value: 'luxury', label: 'Luxury (USh 11,400,000 - USh 19,000,000)' },
        { value: 'ultra_luxury', label: 'Ultra Luxury (Above USh 19,000,000)' },
        { value: 'custom', label: 'Custom Budget Range' }
      ]
    };
    return ranges[currencyCode as keyof typeof ranges] || ranges.USD;
  };

  const budgetRanges = getBudgetRanges(currency);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Estimated Budget Range */}
          <div className="space-y-2">
            <Label htmlFor="estimated_budget_range">Estimated Budget Range</Label>
            <Select
              value={formData.estimated_budget_range}
              onValueChange={(value) =>
                setFormData({ ...formData, estimated_budget_range: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Special Requirements */}
          <div className="space-y-2">
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              placeholder="Any special requirements, dietary restrictions, accessibility needs, medical conditions, celebrations, etc."
              value={formData.special_requirements}
              onChange={(e) =>
                setFormData({ ...formData, special_requirements: e.target.value })
              }
              rows={4}
            />
          </div>

          {/* Document Checklist Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Document Preparation</h4>
            <p className="text-sm text-blue-700">
              {formData.tour_type === 'international' 
                ? "Required documents will include: Valid passport, visa (if required), travel insurance, flight tickets, hotel confirmations, and any destination-specific requirements."
                : "Required documents will include: Valid ID proof, travel insurance (optional), transport tickets, hotel confirmations, and any regional requirements."
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
