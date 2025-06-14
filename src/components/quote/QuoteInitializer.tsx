import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarIcon, Users, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { QuoteData } from "../../types/quote.types";
import { InquiryData as Inquiry } from "../../types/inquiry.types";

interface QuoteInitializerProps {
  onInitializeQuote: (quote: QuoteData) => void;
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
    startDate: null as Date | null,
    endDate: null as Date | null,
    adults: 1,
    childrenWithBed: 0,
    childrenNoBed: 0,
    infants: 0,
    tourType: "domestic",
    notes: ""
  });

  // Auto-populate form when inquiry is selected
  useEffect(() => {
    if (preselectedInquiry) {
      setFormData({
        client: preselectedInquiry.client_name,
        mobile: preselectedInquiry.client_mobile,
        destination: preselectedInquiry.destination || preselectedInquiry.custom_destination || "",
        startDate: new Date(preselectedInquiry.check_in_date),
        endDate: new Date(preselectedInquiry.check_out_date),
        adults: preselectedInquiry.adults,
        childrenWithBed: preselectedInquiry.children,
        childrenNoBed: 0, // Default as inquiry doesn't distinguish
        infants: preselectedInquiry.infants,
        tourType: preselectedInquiry.tour_type,
        notes: preselectedInquiry.description || ""
      });
    }
  }, [preselectedInquiry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      return;
    }

    // Calculate duration
    const timeDiff = formData.endDate.getTime() - formData.startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const quoteData: QuoteData = {
      id: `quote-${Date.now()}`,
      client: formData.client,
      mobile: formData.mobile,
      destination: formData.destination,
      start_date: format(formData.startDate, 'yyyy-MM-dd'),
      end_date: format(formData.endDate, 'yyyy-MM-dd'),
      duration_days: daysDiff,
      duration_nights: Math.max(0, daysDiff - 1),
      adults: formData.adults,
      children_with_bed: formData.childrenWithBed,
      children_no_bed: formData.childrenNoBed,
      infants: formData.infants,
      tour_type: formData.tourType,
      status: 'draft',
      markup_type: 'percentage',
      markup_value: 15,
      currency_code: 'USD',
      notes: formData.notes,
      room_arrangements: [],
      activities: [],
      transports: [],
      transfers: [],
      sectionMarkups: {}
    };

    onInitializeQuote(quoteData);
  };

  const isFormValid = formData.client && formData.mobile && formData.destination && 
                     formData.startDate && formData.endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          {preselectedInquiry ? "Review & Initialize Quote" : "Quote Basic Information"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client Name *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                placeholder="Enter client name"
                required
                disabled={!!preselectedInquiry}
              />
            </div>
            
            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                placeholder="Enter mobile number"
                required
                disabled={!!preselectedInquiry}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="destination">Destination *</Label>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
                placeholder="Enter destination"
                required
                disabled={!!preselectedInquiry}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate || undefined}
                    onSelect={(date) => setFormData({...formData, startDate: date || null})}
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
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate || undefined}
                    onSelect={(date) => setFormData({...formData, endDate: date || null})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="adults">Adults</Label>
              <Input
                id="adults"
                type="number"
                min="1"
                value={formData.adults}
                onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value) || 1})}
                disabled={!!preselectedInquiry}
              />
            </div>
            
            <div>
              <Label htmlFor="childrenWithBed">Children (with bed)</Label>
              <Input
                id="childrenWithBed"
                type="number"
                min="0"
                value={formData.childrenWithBed}
                onChange={(e) => setFormData({...formData, childrenWithBed: parseInt(e.target.value) || 0})}
                disabled={!!preselectedInquiry}
              />
            </div>
            
            <div>
              <Label htmlFor="childrenNoBed">Children (no bed)</Label>
              <Input
                id="childrenNoBed"
                type="number"
                min="0"
                value={formData.childrenNoBed}
                onChange={(e) => setFormData({...formData, childrenNoBed: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div>
              <Label htmlFor="infants">Infants</Label>
              <Input
                id="infants"
                type="number"
                min="0"
                value={formData.infants}
                onChange={(e) => setFormData({...formData, infants: parseInt(e.target.value) || 0})}
                disabled={!!preselectedInquiry}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tourType">Tour Type</Label>
            <Select 
              value={formData.tourType} 
              onValueChange={(value) => setFormData({...formData, tourType: value})}
              disabled={!!preselectedInquiry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tour type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domestic">Domestic</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any special requirements or notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              {preselectedInquiry ? "Initialize Quote from Inquiry" : "Initialize Quote"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuoteInitializer;
