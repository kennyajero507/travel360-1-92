
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
            // Ensure KES is the default currency
            const quoteWithCurrency = {
                ...quote,
                currency_code: quote.currency_code || 'KES',
                preferred_currency: quote.preferred_currency || 'KES'
            };
            
            const savedQuote = await createQuote(quoteWithCurrency);
            toast.success("Quote created successfully! Redirecting to edit view...");
            navigate(`/quotes/${savedQuote.id}`);
        } catch (error) {
            console.error("Quote creation failed:", error);
            toast.error("Failed to create quote. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Create New Quote</h1>
            </div>
            <QuoteCreationWizard onQuoteCreate={handleQuoteCreate} />
        </div>
    );
};

export default CreateQuote;
