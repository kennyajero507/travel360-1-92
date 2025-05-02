
import React, { createContext, useContext, useState } from 'react';

type Currency = {
  code: string;
  symbol: string;
  name: string;
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  currencies: Currency[];
}

const currencies: Currency[] = [
  { code: 'KES', symbol: 'Ksh', name: 'Kenyan Shilling' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(currencies[0]); // Default to KES
  
  const formatAmount = (amount: number): string => {
    return `${currency.symbol} ${amount.toLocaleString()}`;
  };

  const contextValue: CurrencyContextType = {
    currency,
    setCurrency,
    formatAmount,
    currencies
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
