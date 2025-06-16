
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { currencyService } from '../../services/currencyService';

interface MultiCurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  className?: string;
}

const MultiCurrencySelector: React.FC<MultiCurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  className
}) => {
  const currencies = currencyService.getSupportedCurrencies();

  return (
    <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <span>{currency.symbol}</span>
              <span>{currency.code}</span>
              <span className="text-gray-500">- {currency.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MultiCurrencySelector;
