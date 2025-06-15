
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { getAvailableInquiries } from "../../services/inquiry/api";
import InquirySelector from "./InquirySelector";
import QuoteInitializer from "./QuoteInitializer";
import { InquiryData } from "../../types/inquiry.types";
import { QuoteData } from "../../types/quote.types";
import { mapInquiryToQuote } from "../../utils/inquiryToQuoteMapper";
import { Skeleton } from "../ui/skeleton";

interface QuoteCreationWizardProps {
  onQuoteCreate: (quote: QuoteData) => void;
}

const QuoteCreationWizard: React.FC<QuoteCreationWizardProps> = ({ onQuoteCreate }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'inquiry' | 'details'>('inquiry');
  const [availableInquiries, setAvailableInquiries] = useState<InquiryData[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if we have a pre-selected inquiry from URL params
  const preselectedInquiryId = searchParams.get('inquiryId');

  useEffect(() => {
    const loadInquiries = async () => {
      try {
        const inquiries = await getAvailableInquiries();
        setAvailableInquiries(inquiries);

        // If we have a preselected inquiry, find it and move to details step
        if (preselectedInquiryId) {
          const preselected = inquiries.find(inq => inq.id === preselectedInquiryId);
          if (preselected) {
            setSelectedInquiry(preselected);
            setStep('details');
          }
        }
      } catch (error) {
        console.error('Failed to load inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, [preselectedInquiryId]);

  const handleInquirySelection = (inquiry: InquiryData | null) => {
    setSelectedInquiry(inquiry);
    setStep('details');
  };

  const handleQuoteInitialize = (quote: QuoteData) => {
    // If we have a selected inquiry, merge its data
    if (selectedInquiry) {
      const inquiryData = mapInquiryToQuote(selectedInquiry);
      const mergedQuote: QuoteData = {
        ...quote,
        ...inquiryData,
        // Preserve any manual changes from the form
        client: quote.client || inquiryData.client || "",
        mobile: quote.mobile || inquiryData.mobile || "",
        destination: quote.destination || inquiryData.destination || "",
        notes: quote.notes || inquiryData.notes || ""
      };
      onQuoteCreate(mergedQuote);
    } else {
      onQuoteCreate(quote);
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('inquiry');
      setSelectedInquiry(null);
    } else {
      navigate('/quotes');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className={step === 'inquiry' ? 'font-medium text-gray-900' : ''}>
            1. Select Inquiry
          </span>
          <span>→</span>
          <span className={step === 'details' ? 'font-medium text-gray-900' : ''}>
            2. Quote Details
          </span>
        </div>
      </div>

      {step === 'inquiry' && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Quote</CardTitle>
          </CardHeader>
          <CardContent>
            <InquirySelector
              inquiries={availableInquiries}
              selectedInquiry={selectedInquiry}
              onInquirySelect={handleInquirySelection}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

      {step === 'details' && (
        <QuoteInitializer
          onInitializeQuote={handleQuoteInitialize}
          onCancel={handleBack}
          preselectedInquiry={selectedInquiry}
        />
      )}
    </div>
  );
};

export default QuoteCreationWizard;
