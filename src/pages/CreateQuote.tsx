
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuoteData } from '../hooks/useQuoteData';
import QuoteCreationWizard from '../components/quote/QuoteCreationWizard';
import { QuoteData } from '../types/quote.types';
import { toast } from 'sonner';

const CreateQuote = () => {
    const navigate = useNavigate();
    const { createQuote, isCreating } = useQuoteData();

    const handleQuoteCreate = async (quote: QuoteData) => {
        try {
            const savedQuote = await createQuote(quote);
            // The success toast is now handled consistently in the useQuoteData hook.
            // A toast with "Redirecting..." could be added here if desired.
            navigate(`/quotes/${savedQuote.id}`);
        } catch (error) {
            // error is already toasted by the hook, so no action needed here.
            console.error("Quote creation failed:", error);
        }
    };

    return (
        <QuoteCreationWizard onQuoteCreate={handleQuoteCreate} />
    );
};

export default CreateQuote;
