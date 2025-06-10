
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DatePicker } from "../ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { QuoteData } from "../../types/quote.types";
import { User, Phone, MapPin, Calendar, Users, Check, Pencil } from "lucide-react";
import { Badge } from "../ui/badge";

interface ClientDetailsEditableSectionProps {
  quote: QuoteData;
  onQuoteUpdate: (updatedQuote: Partial<QuoteData>) => void;
}

const ClientDetailsEditableSection: React.FC<ClientDetailsEditableSectionProps> = ({ 
  quote, 
  onQuoteUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    client: quote.client,
    mobile: quote.mobile,
    destination: quote.destination,
    start_date: quote.start_date,
    end_date: quote.end_date,
    adults: quote.adults,
    children_with_bed: quote.children_with_bed,
    children_no_bed: quote.children_no_bed,
    infants: quote.infants,
    tour_type: quote.tour_type
  });

  // Calculate duration when dates change
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: diffDays,
      nights: Math.max(0, diffDays - 1)
    };
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Recalculate duration when dates change
    if (field === "start_date" || field === "end_date") {
      const startDate = field === "start_date" ? value : formData.start_date;
      const endDate = field === "end_date" ? value : formData.end_date;
      
      if (startDate && endDate) {
        const duration = calculateDuration(startDate, endDate);
        setFormData(prev => ({
          ...prev,
          duration_days: duration.days,
          duration_nights: duration.nights
        }));
      }
    }
  };

  const handleSave = () => {
    const duration = calculateDuration(formData.start_date, formData.end_date);
    
    onQuoteUpdate({
      ...formData,
      duration_days: duration.days,
      duration_nights: duration.nights
    });
    
    setIsEditing(false);
  };

  // Render the card in view mode
  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Client Details
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Client
              </div>
              <p className="font-medium">{quote.client}</p>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Mobile
              </div>
              <p>{quote.mobile}</p>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Destination
              </div>
              <p>{quote.destination}</p>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Travel Dates
              </div>
              <p>
                {new Date(quote.start_date).toLocaleDateString()} - {new Date(quote.end_date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Duration
              </div>
              <p>{quote.duration_days} days / {quote.duration_nights} nights</p>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Travelers
              </div>
              <p>
                {quote.adults} Adults
                {quote.children_with_bed > 0 && `, ${quote.children_with_bed} CWB`}
                {quote.children_no_bed > 0 && `, ${quote.children_no_bed} CNB`}
                {quote.infants > 0 && `, ${quote.infants} Infants`}
              </p>
            </div>
            
            {quote.inquiry_id && (
              <div className="space-y-1 col-span-full">
                <div className="text-sm font-medium text-gray-500">Inquiry Reference</div>
                <div>
                  <Badge variant="secondary">
                    Inquiry #{quote.inquiry_id}
                  </Badge>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500">Tour Type</div>
              <p>{quote.tour_type || "Standard"}</p>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500">Status</div>
              <Badge variant={quote.status === "approved" ? "default" : "secondary"}>
                {quote.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render in edit mode
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Edit Client Details
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1"
          >
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client Name</Label>
            <Input 
              id="client" 
              value={formData.client} 
              onChange={(e) => handleChange("client", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input 
              id="mobile" 
              value={formData.mobile} 
              onChange={(e) => handleChange("mobile", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input 
              id="destination" 
              value={formData.destination} 
              onChange={(e) => handleChange("destination", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tour_type">Tour Type</Label>
            <Select 
              value={formData.tour_type || "standard"} 
              onValueChange={(value) => handleChange("tour_type", value)}
            >
              <SelectTrigger id="tour_type">
                <SelectValue placeholder="Select tour type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="honeymoon">Honeymoon</SelectItem>
                <SelectItem value="family">Family</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Start Date</Label>
            <DatePicker
              date={formData.start_date ? new Date(formData.start_date) : undefined}
              onSelect={(date) => handleChange("start_date", date?.toISOString() || "")}
            />
          </div>
          
          <div className="space-y-2">
            <Label>End Date</Label>
            <DatePicker
              date={formData.end_date ? new Date(formData.end_date) : undefined}
              onSelect={(date) => handleChange("end_date", date?.toISOString() || "")}
              disabled={!formData.start_date}
              fromDate={formData.start_date ? new Date(formData.start_date) : undefined}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adults">Adults</Label>
            <Input 
              id="adults" 
              type="number" 
              min="1"
              value={formData.adults} 
              onChange={(e) => handleChange("adults", parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="children_with_bed">Children with Bed</Label>
            <Input 
              id="children_with_bed" 
              type="number" 
              min="0"
              value={formData.children_with_bed} 
              onChange={(e) => handleChange("children_with_bed", parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="children_no_bed">Children without Bed</Label>
            <Input 
              id="children_no_bed" 
              type="number" 
              min="0"
              value={formData.children_no_bed} 
              onChange={(e) => handleChange("children_no_bed", parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="infants">Infants</Label>
            <Input 
              id="infants" 
              type="number" 
              min="0"
              value={formData.infants} 
              onChange={(e) => handleChange("infants", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSave}
            className="flex items-center gap-1"
          >
            <Check className="h-4 w-4" />
            Save Client Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetailsEditableSection;
