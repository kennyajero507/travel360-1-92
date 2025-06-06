import React, { useEffect } from "react";
import { QuoteData } from "../../types/quote.types";

interface QuoteInitializerProps {
  inquiryId?: string;
  onQuoteInitialized: (quote: QuoteData) => void;
}

const QuoteInitializer: React.FC<QuoteInitializerProps> = ({
  inquiryId,
  onQuoteInitialized,
}) => {
  useEffect(() => {
    const initializeQuote = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const initialQuote: QuoteData = {
        id: crypto.randomUUID(),
        inquiry_id: inquiryId,
        client: "",
        mobile: "",
        destination: "",
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        duration_days: 7,
        duration_nights: 6,
        adults: 2,
        children_with_bed: 0,
        children_no_bed: 0,
        infants: 0,
        tour_type: "domestic",
        status: "draft",
        currency_code: "USD",
        markup_type: "percentage",
        markup_value: 15,
        room_arrangements: [],
        activities: [],
        transports: [],
        transfers: [],
        notes: "",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      // If we have an inquiry ID, we could fetch inquiry details here
      // and pre-populate the quote with inquiry information

      onQuoteInitialized(initialQuote);
    };

    initializeQuote();
  }, [inquiryId, onQuoteInitialized]);

  return null; // This component doesn't render anything
};

export default QuoteInitializer;
