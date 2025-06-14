import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useQuoteData } from "../hooks/useQuoteData";
import { inquiryService } from "../services/inquiry";
import InquirySelector from "../components/quote/InquirySelector";
import { QuoteData } from "../types/quote.types";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { InquiryData } from "../types/inquiry.types";

const CreateQuote = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createQuote } = useQuoteData();
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);
  const [quotesForInquiry, setQuotesForInquiry] = useState<any[]>([]);

  // Check if inquiry ID is provided in URL params
  const inquiryIdFromUrl = searchParams.get('inquiryId');

  // Fetch available inquiries
  const { data: inquiries = [], isLoading: loadingInquiries } = useQuery({
    queryKey: ['available-inquiries'],
    queryFn: inquiryService.getAvailableInquiries
  });

  // Auto-select inquiry if provided in URL
  useEffect(() => {
    if (inquiryIdFromUrl && inquiries.length > 0) {
      const inquiry = inquiries.find(i => i.id === inquiryIdFromUrl);
      if (inquiry) {
        setSelectedInquiry(inquiry);
      }
    }
  }, [inquiryIdFromUrl, inquiries]);

  // Check for existing quotes when inquiry is selected
  useEffect(() => {
    const checkExistingQuotes = async () => {
      if (selectedInquiry) {
        try {
          setQuotesForInquiry([]);
        } catch (error) {
          console.error("Error checking existing quotes:", error);
        }
      }
    };

    checkExistingQuotes();
  }, [selectedInquiry]);

  const handleInitializeQuote = async (quoteData: QuoteData) => {
    try {
      console.log('Creating quote with data:', quoteData);
      
      // Add inquiry_id if an inquiry is selected
      if (selectedInquiry) {
        quoteData.inquiry_id = selectedInquiry.id;
        // Auto-populate data from inquiry
        quoteData.client = selectedInquiry.client_name;
        quoteData.mobile = selectedInquiry.client_mobile;
        quoteData.destination = selectedInquiry.destination || selectedInquiry.custom_destination || "";
        quoteData.start_date = selectedInquiry.check_in_date;
        quoteData.end_date = selectedInquiry.check_out_date;
        quoteData.adults = selectedInquiry.adults;
        quoteData.children_with_bed = selectedInquiry.children;
        quoteData.children_no_bed = 0; // Default as inquiry doesn't distinguish
        quoteData.infants = selectedInquiry.infants;
        quoteData.tour_type = selectedInquiry.tour_type;
        
        // Calculate duration
        const startDate = new Date(selectedInquiry.check_in_date);
        const endDate = new Date(selectedInquiry.check_out_date);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        quoteData.duration_days = daysDiff;
        quoteData.duration_nights = Math.max(0, daysDiff - 1);
      }
      
      // Set default values for required fields
      quoteData.currency_code = quoteData.currency_code || 'USD';
      quoteData.markup_type = quoteData.markup_type || 'percentage';
      quoteData.markup_value = quoteData.markup_value || 25;
      quoteData.status = 'draft';
      
      // Initialize empty arrays for sections
      quoteData.room_arrangements = [];
      quoteData.activities = [];
      quoteData.transports = [];
      quoteData.transfers = [];
      
      console.log('Final quote data before creation:', quoteData);
      
      const newQuote = await createQuote(quoteData);
      console.log('Quote created successfully:', newQuote);
      
      if (newQuote && newQuote.id) {
        // Navigate to edit page with the new quote ID
        navigate(`/quotes/${newQuote.id}`);
      } else {
        throw new Error('Quote creation failed - no ID returned');
      }
    } catch (error) {
      console.error("Error creating quote:", error);
    }
  };

  const handleCancel = () => {
    navigate("/quotes");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
          <p className="text-gray-600">Initialize a new quote for a client</p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {/* Inquiry Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Link to Existing Inquiry (Recommended)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InquirySelector
            inquiries={inquiries}
            selectedInquiry={selectedInquiry}
            onInquirySelect={setSelectedInquiry}
            loading={loadingInquiries}
          />
          
          {selectedInquiry && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Quote will be auto-populated with details from inquiry: <strong>{selectedInquiry.enquiry_number}</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quote Initializer */}
      <QuoteInitializer
        onInitializeQuote={handleInitializeQuote}
        onCancel={handleCancel}
        preselectedInquiry={selectedInquiry}
      />
    </div>
  );
};

export default CreateQuote;
