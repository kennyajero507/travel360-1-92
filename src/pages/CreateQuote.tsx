
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useQuoteData } from "../hooks/useQuoteData";
import { getAvailableInquiries } from "../services/quoteService";
import QuoteInitializer from "../components/quote/QuoteInitializer";
import { QuoteData } from "../types/quote.types";
import { useQuery } from "@tanstack/react-query";

const CreateQuote = () => {
  const navigate = useNavigate();
  const { createQuote } = useQuoteData();
  const [preselectedInquiry, setPreselectedInquiry] = useState<any>(null);

  // Fetch available inquiries
  const { data: inquiries = [] } = useQuery({
    queryKey: ['available-inquiries'],
    queryFn: getAvailableInquiries
  });

  const handleInitializeQuote = async (quoteData: QuoteData) => {
    try {
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

      <QuoteInitializer
        onInitializeQuote={handleInitializeQuote}
        onCancel={handleCancel}
        preselectedInquiry={preselectedInquiry}
      />
    </div>
  );
};

export default CreateQuote;
