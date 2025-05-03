
import React, { createContext, useContext, useState } from 'react';

// Updated to use an object instead of a simple string
interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  currencies: Currency[]; // Added currencies array property
}

// Define available currencies
const availableCurrencies: Currency[] = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' }
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with KES as default currency
  const [currency, setCurrency] = useState<Currency>(availableCurrencies[0]);

  const formatAmount = (amount: number): string => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatAmount, 
      currencies: availableCurrencies 
    }}>
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
