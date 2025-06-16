
import { useState, useCallback, useMemo } from 'react';
import { currencyService } from '../services/currencyService';
import { QuoteData } from '../types/quote.types';

export const useMultiCurrency = (quote: QuoteData | null, initialCurrency: string = 'KES') => {
  const [displayCurrency, setDisplayCurrency] = useState(initialCurrency);

  const convertAmount = useCallback((amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    
    try {
      const conversion = currencyService.convertCurrency(amount, fromCurrency, toCurrency);
      return conversion.convertedAmount;
    } catch (error) {
      console.error('Currency conversion error:', error);
      return amount;
    }
  }, []);

  const formatAmount = useCallback((amount: number, currency?: string) => {
    return currencyService.formatAmount(amount, currency || displayCurrency);
  }, [displayCurrency]);

  const convertedQuoteTotals = useMemo(() => {
    if (!quote) return null;

    const baseCurrency = quote.currency_code || 'KES';
    
    // Calculate totals in base currency
    const accommodationTotal = quote.room_arrangements?.reduce((sum, arr) => sum + (arr.total || 0), 0) || 0;
    const transportTotal = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
    const transferTotal = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
    const activityTotal = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;
    
    const subtotal = accommodationTotal + transportTotal + transferTotal + activityTotal;
    
    // Apply markup
    let markupAmount = 0;
    if (quote.markup_type === 'percentage') {
      markupAmount = (subtotal * (quote.markup_value || 0)) / 100;
    } else {
      markupAmount = quote.markup_value || 0;
    }
    
    const grandTotal = subtotal + markupAmount;

    // Convert to display currency
    return {
      accommodation: convertAmount(accommodationTotal, baseCurrency, displayCurrency),
      transport: convertAmount(transportTotal, baseCurrency, displayCurrency),
      transfer: convertAmount(transferTotal, baseCurrency, displayCurrency),
      activity: convertAmount(activityTotal, baseCurrency, displayCurrency),
      subtotal: convertAmount(subtotal, baseCurrency, displayCurrency),
      markup: convertAmount(markupAmount, baseCurrency, displayCurrency),
      grandTotal: convertAmount(grandTotal, baseCurrency, displayCurrency),
      baseCurrency,
      displayCurrency
    };
  }, [quote, displayCurrency, convertAmount]);

  return {
    displayCurrency,
    setDisplayCurrency,
    convertAmount,
    formatAmount,
    convertedQuoteTotals
  };
};
