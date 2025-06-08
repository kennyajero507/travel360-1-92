
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useQuoteData } from "../hooks/useQuoteData";
import { inquiryService, Inquiry } from "../services/inquiryService";
import QuoteInitializer from "../components/quote/QuoteInitializer";
import InquirySelector from "../components/quote/InquirySelector";
import { QuoteData } from "../types/quote.types";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FileText } from "lucide-react";

const CreateQuote = () => {
  const navigate = useNavigate();
  const { createQuote } = useQuoteData();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Fetch available inquiries
  const { data: inquiries = [], isLoading: loadingInquiries } = useQuery({
    queryKey: ['available-inquiries'],
    queryFn: inquiryService.getAvailableInquiries
  });

  const handleInitializeQuote = async (quoteData: QuoteData) => {
    try {
      // Add inquiry_id if an inquiry is selected
      if (selectedInquiry) {
        quoteData.inquiry_id = selectedInquiry.id;
      }
      
      const newQuote = await createQuote(quoteData);
      if (newQuote && newQuote.id) {
        navigate(`/edit-quote/${newQuote.id}`);
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
            Link to Existing Inquiry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InquirySelector
            inquiries={inquiries}
            selectedInquiry={selectedInquiry}
            onInquirySelect={setSelectedInquiry}
            loading={loadingInquiries}
          />
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
