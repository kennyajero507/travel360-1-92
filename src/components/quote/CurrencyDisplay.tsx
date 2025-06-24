
import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { currencyService } from '../../services/currencyService';

interface CurrencyDisplayProps {
  amount: number;
  currencyCode?: string;
  className?: string;
  showSymbol?: boolean;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  currencyCode, 
  className = '',
  showSymbol = true 
}) => {
  const { currency: contextCurrency } = useCurrency();
  
  // Use provided currency code or fall back to context currency
  const displayCurrency = currencyCode || contextCurrency.code;
  
  // Format the amount using the currency service
  const formattedAmount = currencyService.formatAmount(amount, displayCurrency);
  
  // If showSymbol is false, extract just the number part
  const displayValue = showSymbol ? formattedAmount : amount.toLocaleString();
  
  return (
    <span className={`font-medium ${className}`} data-currency={displayCurrency}>
      {displayValue}
    </span>
  );
};

export default CurrencyDisplay;
