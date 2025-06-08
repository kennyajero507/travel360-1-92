
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { FileText, Calendar, Users, MapPin } from "lucide-react";
import { Inquiry } from "../../services/inquiryService";
import { format } from "date-fns";

interface InquirySelectorProps {
  inquiries: Inquiry[];
  selectedInquiry: Inquiry | null;
  onInquirySelect: (inquiry: Inquiry | null) => void;
  loading?: boolean;
}

const InquirySelector: React.FC<InquirySelectorProps> = ({
  inquiries,
  selectedInquiry,
  onInquirySelect,
  loading = false
}) => {
  const handleInquiryChange = (inquiryId: string) => {
    if (inquiryId === "none") {
      onInquirySelect(null);
      return;
    }
    
    const inquiry = inquiries.find(i => i.id === inquiryId);
    onInquirySelect(inquiry || null);
  };

  const formatTravelerCount = (inquiry: Inquiry) => {
    const parts = [];
    if (inquiry.adults > 0) parts.push(`${inquiry.adults} Adult${inquiry.adults > 1 ? 's' : ''}`);
    if (inquiry.children > 0) parts.push(`${inquiry.children} Child${inquiry.children > 1 ? 'ren' : ''}`);
    if (inquiry.infants > 0) parts.push(`${inquiry.infants} Infant${inquiry.infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="inquiry">Select Inquiry (Optional)</Label>
        <Select
          value={selectedInquiry?.id || "none"}
          onValueChange={handleInquiryChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Loading inquiries..." : "Choose an inquiry or create from scratch"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Create quote from scratch</SelectItem>
            {inquiries.map((inquiry) => (
              <SelectItem key={inquiry.id} value={inquiry.id}>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {inquiry.enquiry_number} - {inquiry.client_name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedInquiry && (
        <Card className="border border-blue-100 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              Inquiry Details
              <Badge variant="outline" className="ml-auto">
                {selectedInquiry.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{formatTravelerCount(selectedInquiry)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{selectedInquiry.destination}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {format(new Date(selectedInquiry.check_in_date), 'MMM dd, yyyy')} - {' '}
                {format(new Date(selectedInquiry.check_out_date), 'MMM dd, yyyy')}
                ({selectedInquiry.nights_count || 0} nights)
              </span>
            </div>
            {selectedInquiry.description && (
              <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                {selectedInquiry.description}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InquirySelector;
