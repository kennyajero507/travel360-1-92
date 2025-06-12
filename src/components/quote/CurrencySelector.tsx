
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CurrencySelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  const { currency, setCurrency, currencies } = useCurrency();

  const handleCurrencyChange = (currencyCode: string) => {
    const selectedCurrency = currencies.find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
      onValueChange?.(currencyCode);
    }
  };

  const currentValue = value || currency.code;

  return (
    <Select value={currentValue} onValueChange={handleCurrencyChange}>
      <SelectTrigger className={`w-[120px] ${className}`}>
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{curr.symbol}</span>
              <span>{curr.code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelector;
