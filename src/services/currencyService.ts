
import { supabase } from "../integrations/supabase/client";

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate relative to KES (Kenya Shilling)
}

export interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  rate: number;
}

// Updated currency data with KES as base currency
const SUPPORTED_CURRENCIES: CurrencyRate[] = [
  { code: 'KES', name: 'Kenya Shilling', symbol: 'KSh', rate: 1 }, // Base currency
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.0067 }, // 1 KES = 0.0067 USD
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.0062 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.0053 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 0.0091 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 0.0103 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 0.98 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 0.12 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 18.5 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rate: 25.2 },
];

export class CurrencyService {
  private static instance: CurrencyService;
  private rates: Map<string, CurrencyRate> = new Map();

  private constructor() {
    // Initialize with static rates
    SUPPORTED_CURRENCIES.forEach(currency => {
      this.rates.set(currency.code, currency);
    });
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  // Get all supported currencies
  getSupportedCurrencies(): CurrencyRate[] {
    return Array.from(this.rates.values());
  }

  // Get currency by code
  getCurrency(code: string): CurrencyRate | null {
    return this.rates.get(code) || null;
  }

  // Convert amount between currencies
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): CurrencyConversion {
    const fromRate = this.rates.get(fromCurrency);
    const toRate = this.rates.get(toCurrency);

    if (!fromRate || !toRate) {
      throw new Error(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`);
    }

    // Convert to KES first, then to target currency
    const kesAmount = amount / fromRate.rate;
    const convertedAmount = kesAmount * toRate.rate;
    const conversionRate = toRate.rate / fromRate.rate;

    return {
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      rate: Math.round(conversionRate * 10000) / 10000
    };
  }

  // Format amount with currency symbol
  formatAmount(amount: number, currencyCode: string): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) return `${amount}`;

    // Format with appropriate decimal places
    const decimals = ['JPY', 'KES', 'TZS', 'UGX'].includes(currencyCode) ? 0 : 2;
    const formattedAmount = amount.toFixed(decimals);

    // Add thousand separators for KES
    if (currencyCode === 'KES') {
      const parts = formattedAmount.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${currency.symbol} ${parts.join('.')}`;
    }

    return `${currency.symbol}${formattedAmount}`;
  }

  // Get exchange rate between two currencies
  getExchangeRate(fromCurrency: string, toCurrency: string): number {
    const fromRate = this.rates.get(fromCurrency);
    const toRate = this.rates.get(toCurrency);

    if (!fromRate || !toRate) {
      return 1; // Default to 1:1 if currencies not found
    }

    return toRate.rate / fromRate.rate;
  }

  // Update currency rates (for future API integration)
  async updateRates(): Promise<void> {
    try {
      // In production, this would fetch from a currency API
      // For now, we'll keep static rates
      console.log('Currency rates updated');
    } catch (error) {
      console.error('Failed to update currency rates:', error);
    }
  }

  // Get Kenya regions for domestic tours
  getKenyaRegions(): string[] {
    return [
      'Nairobi',
      'Mombasa',
      'Kisumu',
      'Nakuru',
      'Eldoret',
      'Thika',
      'Malindi',
      'Kitale',
      'Garissa',
      'Kakamega',
      'Machakos',
      'Meru',
      'Nyeri',
      'Kericho',
      'Embu',
      'Migori',
      'Homa Bay',
      'Naivasha',
      'Nanyuki',
      'Diani Beach',
      'Watamu',
      'Lamu',
      'Amboseli',
      'Maasai Mara',
      'Tsavo East',
      'Tsavo West',
      'Samburu',
      'Mount Kenya',
      'Aberdare',
      'Lake Nakuru'
    ];
  }

  // Get East Africa countries for international tours
  getEastAfricaCountries(): string[] {
    return [
      'Kenya',
      'Tanzania',
      'Uganda',
      'Rwanda',
      'Burundi',
      'South Sudan',
      'Ethiopia',
      'Somalia',
      'Djibouti',
      'Eritrea'
    ];
  }
}

export const currencyService = CurrencyService.getInstance();
