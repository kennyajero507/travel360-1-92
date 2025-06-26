
import React from 'react';

interface CurrencyDisplayProps {
  amount: number;
  currencyCode?: string;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  currencyCode = 'KES',
  className 
}) => {
  const formatCurrency = (value: number, code: string) => {
    // Handle different currency symbols
    const currencySymbols: { [key: string]: string } = {
      'KES': 'KSh',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'TZS': 'TSh',
      'UGX': 'USh'
    };

    const symbol = currencySymbols[code] || code;
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        currencyDisplay: 'symbol',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value).replace(/^[A-Z]{3}/, symbol);
    } catch (error) {
      // Fallback formatting if currency is not supported
      return `${symbol} ${value.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      })}`;
    }
  };

  return (
    <span className={className}>
      {formatCurrency(amount, currencyCode)}
    </span>
  );
};

export default CurrencyDisplay;
