
import { supabase } from '../integrations/supabase/client';
import { systemErrorHandler } from './systemErrorHandler';

interface ExchangeRate {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  last_updated: string;
}

class RealCurrencyService {
  private supportedCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'CHF', 'SEK'
  ];

  private fallbackRates: Record<string, number> = {
    'USD_EUR': 0.85,
    'USD_GBP': 0.73,
    'USD_JPY': 110.0,
    'USD_CAD': 1.25,
    'USD_AUD': 1.35,
    'USD_INR': 75.0,
    'USD_CNY': 6.5,
    'USD_CHF': 0.92,
    'USD_SEK': 8.5
  };

  async getExchangeRates(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching exchange rates:', error);
        await systemErrorHandler.handleError({
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch exchange rates',
          context: { error: error.message },
          severity: 'medium'
        });
        return this.fallbackRates;
      }

      const rates: Record<string, number> = {};
      data?.forEach((rate: ExchangeRate) => {
        const key = `${rate.base_currency}_${rate.target_currency}`;
        rates[key] = rate.rate;
      });

      // If no rates found, use fallback
      if (Object.keys(rates).length === 0) {
        console.log('No exchange rates found, using fallback rates');
        return this.fallbackRates;
      }

      return { ...this.fallbackRates, ...rates };
    } catch (error) {
      console.error('Error in getExchangeRates:', error);
      await systemErrorHandler.handleError({
        code: 'CURRENCY_SERVICE_ERROR',
        message: 'Failed to get exchange rates',
        context: { error },
        severity: 'medium'
      });
      return this.fallbackRates;
    }
  }

  async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const rates = await this.getExchangeRates();
      
      // Direct conversion
      const directKey = `${fromCurrency}_${toCurrency}`;
      if (rates[directKey]) {
        return Math.round(amount * rates[directKey] * 100) / 100;
      }

      // Reverse conversion
      const reverseKey = `${toCurrency}_${fromCurrency}`;
      if (rates[reverseKey]) {
        return Math.round((amount / rates[reverseKey]) * 100) / 100;
      }

      // Convert via USD
      let convertedAmount = amount;
      
      if (fromCurrency !== 'USD') {
        const toUsdKey = `${fromCurrency}_USD`;
        const reverseToUsdKey = `USD_${fromCurrency}`;
        
        if (rates[toUsdKey]) {
          convertedAmount = convertedAmount * rates[toUsdKey];
        } else if (rates[reverseToUsdKey]) {
          convertedAmount = convertedAmount / rates[reverseToUsdKey];
        } else {
          throw new Error(`No conversion rate found for ${fromCurrency} to USD`);
        }
      }

      if (toCurrency !== 'USD') {
        const fromUsdKey = `USD_${toCurrency}`;
        const reverseFromUsdKey = `${toCurrency}_USD`;
        
        if (rates[fromUsdKey]) {
          convertedAmount = convertedAmount * rates[fromUsdKey];
        } else if (rates[reverseFromUsdKey]) {
          convertedAmount = convertedAmount / rates[reverseFromUsdKey];
        } else {
          throw new Error(`No conversion rate found for USD to ${toCurrency}`);
        }
      }

      return Math.round(convertedAmount * 100) / 100;
    } catch (error) {
      console.error('Error converting currency:', error);
      await systemErrorHandler.handleError({
        code: 'CURRENCY_CONVERSION_ERROR',
        message: `Failed to convert ${fromCurrency} to ${toCurrency}`,
        context: { fromCurrency, toCurrency, amount, error },
        severity: 'low'
      });
      return amount; // Return original amount if conversion fails
    }
  }

  formatCurrency(amount: number, currencyCode: string): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
  }

  getSupportedCurrencies(): string[] {
    return this.supportedCurrencies;
  }

  async updateExchangeRates(rates: Record<string, number>): Promise<boolean> {
    try {
      const updates = Object.entries(rates).map(([pair, rate]) => {
        const [base, target] = pair.split('_');
        return {
          base_currency: base,
          target_currency: target,
          rate,
          last_updated: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('exchange_rates')
        .upsert(updates, { 
          onConflict: 'base_currency,target_currency' 
        });

      if (error) {
        await systemErrorHandler.handleError({
          code: 'DATABASE_ERROR',
          message: 'Failed to update exchange rates',
          context: { error: error.message },
          severity: 'medium'
        });
        return false;
      }

      console.log('Exchange rates updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      await systemErrorHandler.handleError({
        code: 'CURRENCY_UPDATE_ERROR',
        message: 'Failed to update exchange rates',
        context: { error },
        severity: 'medium'
      });
      return false;
    }
  }

  async initializeFallbackRates(): Promise<void> {
    try {
      // Check if rates exist
      const { data } = await supabase
        .from('exchange_rates')
        .select('id')
        .limit(1);

      if (!data || data.length === 0) {
        console.log('Initializing fallback exchange rates...');
        await this.updateExchangeRates(this.fallbackRates);
      }
    } catch (error) {
      console.error('Error initializing fallback rates:', error);
    }
  }
}

export const realCurrencyService = new RealCurrencyService();
