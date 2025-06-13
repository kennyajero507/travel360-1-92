
import { useState, useEffect } from 'react';
import { currencyService } from '../services/currencyService';
import { useAuth } from '../contexts/AuthContext';

export const useCurrency = () => {
  const { userProfile } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  useEffect(() => {
    if (userProfile?.preferred_currency) {
      setSelectedCurrency(userProfile.preferred_currency);
    }
  }, [userProfile]);

  const convertAmount = async (amount: number, fromCurrency: string, toCurrency?: string): Promise<number> => {
    const targetCurrency = toCurrency || selectedCurrency;
    return await currencyService.convertAmount(amount, fromCurrency, targetCurrency);
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    return currencyService.formatCurrency(amount, currency || selectedCurrency);
  };

  const getSupportedCurrencies = (): string[] => {
    return currencyService.getSupportedCurrencies();
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    convertAmount,
    formatCurrency,
    getSupportedCurrencies,
    exchangeRates,
  };
};
