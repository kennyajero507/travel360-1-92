
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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

// Define available currencies - expanded list
const availableCurrencies: Currency[] = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' }, // Default currency first
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RWF' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BHD' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'TND' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DZD' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'LYD' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'SEK' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'NOK' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'DKK' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'PLN' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'CZK' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'HUF' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'RON' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'BGN' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'HRK' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'RSD' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'MKD' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'ALL' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'BAM' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'MDL' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: 'UAH' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'BYN' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: 'KZT' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'UZS' },
  { code: 'KGS', name: 'Kyrgystani Som', symbol: 'KGS' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'TJS' },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'TMT' },
  { code: 'GEL', name: 'Georgian Lari', symbol: 'GEL' },
  { code: 'AMD', name: 'Armenian Dram', symbol: 'AMD' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: 'AZN' }
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  
  // Initialize with KES as default currency (Kenya-focused system)
  const [currency, setCurrency] = useState<Currency>(availableCurrencies[0]); // KES is first

  // Update currency when user profile loads
  useEffect(() => {
    if (profile?.currency) {
      const userCurrency = availableCurrencies.find(c => c.code === profile.currency);
      if (userCurrency) {
        setCurrency(userCurrency);
      }
    }
  }, [profile?.currency]);

  const formatAmount = (amount: number): string => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'KES' ? 0 : 2,
      maximumFractionDigits: currency.code === 'KES' ? 0 : 2,
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
