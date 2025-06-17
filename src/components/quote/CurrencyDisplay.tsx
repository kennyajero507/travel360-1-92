
import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showCode?: boolean;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = "", 
  showCode = false 
}) => {
  const { currency } = useCurrency();

  const formatAmount = (value: number) => {
    const decimals = ['JPY', 'KES', 'TZS', 'UGX'].includes(currency.code) ? 0 : 2;
    const formattedAmount = value.toFixed(decimals);

    // Add thousand separators for larger amounts
    if (currency.code === 'KES' || value >= 1000) {
      const parts = formattedAmount.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }

    return formattedAmount;
  };

  return (
    <span className={className}>
      {currency.symbol}{formatAmount(amount)}
      {showCode && ` ${currency.code}`}
    </span>
  );
};

export default CurrencyDisplay;
