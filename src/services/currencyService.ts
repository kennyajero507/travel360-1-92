
import { supabase } from '../integrations/supabase/client';

class CurrencyService {
  private supportedCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY'
  ];

  async getExchangeRates(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*');

      if (error) {
        console.error('Error fetching exchange rates:', error);
        return this.getFallbackRates();
      }

      const rates: Record<string, number> = {};
      data?.forEach(rate => {
        const key = `${rate.base_currency}_${rate.target_currency}`;
        rates[key] = rate.rate;
      });

      return rates;
    } catch (error) {
      console.error('Error in getExchangeRates:', error);
      return this.getFallbackRates();
    }
  }

  private getFallbackRates(): Record<string, number> {
    return {
      'USD_EUR': 0.85,
      'USD_GBP': 0.73,
      'USD_JPY': 110.0,
      'USD_CAD': 1.25,
      'USD_AUD': 1.35,
      'USD_INR': 75.0,
      'USD_CNY': 6.5
    };
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
        return amount * rates[directKey];
      }

      // Reverse conversion
      const reverseKey = `${toCurrency}_${fromCurrency}`;
      if (rates[reverseKey]) {
        return amount / rates[reverseKey];
      }

      // Convert via USD
      if (fromCurrency !== 'USD') {
        const toUsdKey = `${fromCurrency}_USD`;
        const reverseToUsdKey = `USD_${fromCurrency}`;
        
        if (rates[toUsdKey]) {
          amount = amount * rates[toUsdKey];
        } else if (rates[reverseToUsdKey]) {
          amount = amount / rates[reverseToUsdKey];
        }
      }

      if (toCurrency !== 'USD') {
        const fromUsdKey = `USD_${toCurrency}`;
        const reverseFromUsdKey = `${toCurrency}_USD`;
        
        if (rates[fromUsdKey]) {
          amount = amount * rates[fromUsdKey];
        } else if (rates[reverseFromUsdKey]) {
          amount = amount / rates[reverseFromUsdKey];
        }
      }

      return Math.round(amount * 100) / 100;
    } catch (error) {
      console.error('Error converting currency:', error);
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

  async updateExchangeRates(): Promise<void> {
    // In a real implementation, this would fetch from an API like ExchangeRate-API
    // For now, we'll use static rates
    console.log('Exchange rates update would happen here');
  }
}

export const currencyService = new CurrencyService();
