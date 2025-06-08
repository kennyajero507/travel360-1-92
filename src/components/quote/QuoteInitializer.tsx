
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Users, MapPin, FileText } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "../../lib/utils";
import { QuoteData } from "../../types/quote.types";
import { Inquiry } from "../../services/inquiryService";

interface QuoteInitializerProps {
  onInitializeQuote: (quote: QuoteData) => Promise<void>;
  onCancel: () => void;
  preselectedInquiry?: Inquiry | null;
}

const QuoteInitializer: React.FC<QuoteInitializerProps> = ({
  onInitializeQuote,
  onCancel,
  preselectedInquiry
}) => {
  const [formData, setFormData] = useState({
    client: "",
    mobile: "",
    destination: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    adults: 1,
    childrenWithBed: 0,
    childrenNoBed: 0,
    infants: 0,
    tourType: "domestic",
    notes: ""
  });

  // Auto-populate from selected inquiry
  useEffect(() => {
    if (preselectedInquiry) {
      setFormData({
        client: preselectedInquiry.client_name || "",
        mobile: preselectedInquiry.client_mobile || "",
        destination: preselectedInquiry.destination || "",
        startDate: preselectedInquiry.check_in_date ? new Date(preselectedInquiry.check_in_date) : undefined,
        endDate: preselectedInquiry.check_out_date ? new Date(preselectedInquiry.check_out_date) : undefined,
        adults: preselectedInquiry.adults || 1,
        childrenWithBed: Math.floor((preselectedInquiry.children || 0) / 2), // Assume split
        childrenNoBed: Math.ceil((preselectedInquiry.children || 0) / 2),
        infants: preselectedInquiry.infants || 0,
        tourType: preselectedInquiry.tour_type || "domestic",
        notes: preselectedInquiry.description || ""
      });
    }
  }, [preselectedInquiry]);

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return { days: 0, nights: 0 };
    
    const nights = differenceInDays(formData.endDate, formData.startDate);
    const days = nights + 1;
    
    return { days: Math.max(0, days), nights: Math.max(0, nights) };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      return;
    }

    const duration = calculateDuration();
    
    const quoteData: QuoteData = {
      id: crypto.randomUUID(),
      client: formData.client,
      mobile: formData.mobile,
      destination: formData.destination,
      start_date: format(formData.startDate, 'yyyy-MM-dd'),
      end_date: format(formData.endDate, 'yyyy-MM-dd'),
      duration_days: duration.days,
      duration_nights: duration.nights,
      adults: formData.adults,
      children_with_bed: formData.childrenWithBed,
      children_no_bed: formData.childrenNoBed,
      infants: formData.infants,
      tour_type: formData.tourType,
      status: 'draft',
      notes: formData.notes,
      currency_code: 'USD',
      markup_type: 'percentage',
      markup_value: 25,
      room_arrangements: [],
      activities: [],
      transports: [],
      transfers: []
    };

    await onInitializeQuote(quoteData);
  };

  const isFormValid = formData.client && formData.mobile && formData.destination && formData.startDate && formData.endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {preselectedInquiry ? 'Quote from Inquiry' : 'Initialize New Quote'}
        </CardTitle>
        {preselectedInquiry && (
          <p className="text-sm text-green-600">
            Auto-populated from Inquiry #{preselectedInquiry.enquiry_number}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client Name *</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  required
                  disabled={!!preselectedInquiry}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                  disabled={!!preselectedInquiry}
                />
              </div>
            </div>
          </div>

          {/* Travel Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Travel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                  disabled={!!preselectedInquiry}
                />
              </div>
              <div>
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                      disabled={!!preselectedInquiry}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                      disabled={!!preselectedInquiry}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Group Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Group Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="childrenWithBed">Children with Bed</Label>
                <Input
                  id="childrenWithBed"
                  type="number"
                  min="0"
                  value={formData.childrenWithBed}
                  onChange={(e) => setFormData({ ...formData, childrenWithBed: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="childrenNoBed">Children no Bed</Label>
                <Input
                  id="childrenNoBed"
                  type="number"
                  min="0"
                  value={formData.childrenNoBed}
                  onChange={(e) => setFormData({ ...formData, childrenNoBed: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="infants">Infants</Label>
                <Input
                  id="infants"
                  type="number"
                  min="0"
                  value={formData.infants}
                  onChange={(e) => setFormData({ ...formData, infants: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Tour Type */}
          <div>
            <Label htmlFor="tourType">Tour Type</Label>
            <Select 
              value={formData.tourType} 
              onValueChange={(value) => setFormData({ ...formData, tourType: value })}
              disabled={!!preselectedInquiry}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domestic">Domestic</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or special requirements..."
              rows={3}
            />
          </div>

          {/* Duration Display */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <span><strong>Duration:</strong> {calculateDuration().days} days, {calculateDuration().nights} nights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span><strong>Total:</strong> {formData.adults + formData.childrenWithBed + formData.childrenNoBed + formData.infants} travelers</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Initialize Quote
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuoteInitializer;
