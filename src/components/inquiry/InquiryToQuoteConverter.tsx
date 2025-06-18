
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import TourTemplateSelector from '../tours/TourTemplateSelector';

interface InquiryData {
  id: string;
  client_name: string;
  client_email?: string;
  client_mobile: string;
  destination: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  infants: number;
  tour_type: 'domestic' | 'international';
  estimated_budget_range?: string;
  special_requirements?: string;
  status: string;
}

interface InquiryToQuoteConverterProps {
  inquiry: InquiryData;
  onConvert: (quoteData: any) => Promise<void>;
  isConverting?: boolean;
}

const InquiryToQuoteConverter: React.FC<InquiryToQuoteConverterProps> = ({
  inquiry,
  onConvert,
  isConverting = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [conversionType, setConversionType] = useState<'blank' | 'template'>('blank');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    issues: string[];
  }>({ eligible: true, issues: [] });

  const handleOpenDialog = () => {
    setIsOpen(true);
    checkEligibility();
  };

  const checkEligibility = () => {
    const issues: string[] = [];
    
    if (!inquiry.client_name || !inquiry.client_mobile) {
      issues.push('Missing client contact information');
    }
    
    if (!inquiry.destination) {
      issues.push('Missing destination information');
    }
    
    if (!inquiry.check_in_date || !inquiry.check_out_date) {
      issues.push('Missing travel dates');
    }
    
    if (inquiry.status === 'converted') {
      issues.push('Inquiry has already been converted to quote');
    }

    setEligibilityResult({
      eligible: issues.length === 0,
      issues
    });
    setEligibilityChecked(true);
  };

  const calculateNights = () => {
    const startDate = new Date(inquiry.check_in_date);
    const endDate = new Date(inquiry.check_out_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleConvert = async () => {
    if (!eligibilityResult.eligible) return;

    const nights = calculateNights();
    
    const quoteData = {
      inquiry_id: inquiry.id,
      client: inquiry.client_name,
      client_email: inquiry.client_email,
      mobile: inquiry.client_mobile,
      destination: inquiry.destination,
      start_date: inquiry.check_in_date,
      end_date: inquiry.check_out_date,
      duration_days: nights + 1,
      duration_nights: nights,
      adults: inquiry.adults,
      children_with_bed: Math.floor(inquiry.children / 2),
      children_no_bed: Math.ceil(inquiry.children / 2),
      infants: inquiry.infants,
      tour_type: inquiry.tour_type,
      estimated_budget_range: inquiry.estimated_budget_range,
      special_requirements: inquiry.special_requirements,
      status: 'draft',
      notes: additionalNotes,
      // If using template, include template data
      ...(conversionType === 'template' && selectedTemplate && {
        package_name: selectedTemplate.title,
        currency_code: selectedTemplate.currency_code,
        itinerary: selectedTemplate.itinerary,
        room_arrangements: [{
          hotel_name: `${selectedTemplate.destination_name} Hotel`,
          room_type: 'Standard Room',
          nights: nights,
          rooms: 1,
          rate_per_night: selectedTemplate.base_price ? selectedTemplate.base_price / nights : 0,
          total: selectedTemplate.base_price || 0
        }]
      })
    };

    try {
      await onConvert(quoteData);
      setIsOpen(false);
    } catch (error) {
      console.error('Error converting inquiry to quote:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleOpenDialog}
          disabled={inquiry.status === 'converted'}
          variant="outline"
          size="sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          {inquiry.status === 'converted' ? 'Already Converted' : 'Create Quote'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Inquiry to Quote</DialogTitle>
          <DialogDescription>
            Create a quote based on this inquiry from {inquiry.client_name}
          </DialogDescription>
        </DialogHeader>

        {/* Inquiry Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Inquiry Summary</span>
            <Badge variant="outline">{inquiry.destination}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Client:</strong> {inquiry.client_name}</p>
              <p><strong>Mobile:</strong> {inquiry.client_mobile}</p>
              <p><strong>Email:</strong> {inquiry.client_email || 'Not provided'}</p>
            </div>
            <div>
              <p><strong>Travel Dates:</strong> {inquiry.check_in_date} to {inquiry.check_out_date}</p>
              <p><strong>Duration:</strong> {calculateNights()} nights</p>
              <p><strong>Guests:</strong> {inquiry.adults} adults, {inquiry.children} children, {inquiry.infants} infants</p>
            </div>
          </div>
        </div>

        {/* Eligibility Check */}
        {eligibilityChecked && (
          <div className="space-y-3">
            {eligibilityResult.eligible ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Inquiry is ready to be converted to quote.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <p className="font-medium mb-2">Cannot convert inquiry due to:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {eligibilityResult.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Conversion Options */}
        {eligibilityResult.eligible && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="conversion_type">Quote Creation Method</Label>
              <Select value={conversionType} onValueChange={(value: 'blank' | 'template') => setConversionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Create Blank Quote</SelectItem>
                  <SelectItem value="template">Use Tour Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {conversionType === 'template' && (
              <TourTemplateSelector
                onSelectTemplate={setSelectedTemplate}
                selectedTemplateId={selectedTemplate?.id}
                filterCountry={inquiry.tour_type === 'domestic' ? 'Kenya' : undefined}
                filterTourType={inquiry.tour_type}
              />
            )}

            <div>
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional notes for the quote..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConvert} 
                disabled={isConverting || (conversionType === 'template' && !selectedTemplate)}
              >
                {isConverting ? 'Creating...' : 'Create Quote'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InquiryToQuoteConverter;
