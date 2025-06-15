
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
            toast.success("Quote created successfully! Redirecting to editor...");
            navigate(`/quotes/${savedQuote.id}`);
        } catch (error) {
            // error is already toasted by the hook
        }
    };

    return (
        <QuoteCreationWizard onQuoteCreate={handleQuoteCreate} />
    );
};

export default CreateQuote;
