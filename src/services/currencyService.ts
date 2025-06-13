
import { supabase } from "../integrations/supabase/client";

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate relative to USD
}

export interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  rate: number;
}

// Static currency data - in production, this would come from an API
const SUPPORTED_CURRENCIES: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 75 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.5 },
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

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate.rate;
    const convertedAmount = usdAmount * toRate.rate;
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
    const decimals = currencyCode === 'JPY' ? 0 : 2;
    const formattedAmount = amount.toFixed(decimals);

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

  // Save user's preferred currency - now compatible with database schema
  async saveUserCurrencyPreference(userId: string, currencyCode: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          preferred_currency: currencyCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error saving currency preference:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save currency preference:', error);
      throw error;
    }
  }

  // Get user's preferred currency - now compatible with database schema
  async getUserCurrencyPreference(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_currency')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching currency preference:', error);
        return 'USD';
      }
      
      return data?.preferred_currency || 'USD';
    } catch (error) {
      console.error('Failed to get currency preference:', error);
      return 'USD';
    }
  }
}

export const currencyService = CurrencyService.getInstance();
