
import React from 'react';
import { useOrganizationSettings } from '../../hooks/useOrganizationSettings';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showCode?: boolean;
  currencyCode?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = "", 
  showCode = false,
  currencyCode 
}) => {
  const { settings } = useOrganizationSettings();
  
  // Use provided currency code or fall back to organization default
  const currency = currencyCode || settings?.default_currency || 'KES';

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      'KES': 'KSh',
      'TZS': 'TSh',
      'UGX': 'USh',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[code] || code;
  };

  const formatAmount = (value: number) => {
    const decimals = ['JPY', 'KES', 'TZS', 'UGX'].includes(currency) ? 0 : 2;
    const formattedAmount = value.toFixed(decimals);

    // Add thousand separators for larger amounts
    if (currency === 'KES' || value >= 1000) {
      const parts = formattedAmount.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }

    return formattedAmount;
  };

  return (
    <span className={className}>
      {getCurrencySymbol(currency)}{formatAmount(amount)}
      {showCode && ` ${currency}`}
    </span>
  );
};

export default CurrencyDisplay;
