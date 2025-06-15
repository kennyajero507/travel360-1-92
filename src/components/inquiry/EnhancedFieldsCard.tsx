
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { InquiryFormProps } from "../../types/inquiry.types";

export const EnhancedFieldsCard = ({ formData, setFormData, validationErrors }: InquiryFormProps) => {
  const budgetRanges = [
    { value: 'budget', label: 'Budget (Under ₹50,000)' },
    { value: 'standard', label: 'Standard (₹50,000 - ₹1,50,000)' },
    { value: 'premium', label: 'Premium (₹1,50,000 - ₹3,00,000)' },
    { value: 'luxury', label: 'Luxury (₹3,00,000 - ₹5,00,000)' },
    { value: 'ultra_luxury', label: 'Ultra Luxury (Above ₹5,00,000)' },
    { value: 'custom', label: 'Custom Budget Range' }
  ];

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
                : "Required documents will include: Valid ID proof, travel insurance (optional), train/flight tickets, hotel confirmations, and any state-specific requirements."
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
