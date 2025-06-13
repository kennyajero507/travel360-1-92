
import { supabase } from "../integrations/supabase/client";

export interface ExchangeRate {
  base_currency: string;
  target_currency: string;
  rate: number;
  updated_at: string;
}

class CurrencyService {
  private cache: Map<string, { rate: number; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;

    const cacheKey = `${from}-${to}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rate;
    }

    try {
      // Try to get from database first
      const { data } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('base_currency', from)
        .eq('target_currency', to)
        .single();

      if (data) {
        this.cache.set(cacheKey, { rate: data.rate, timestamp: Date.now() });
        return data.rate;
      }

      // If not in database, use fallback rates
      const fallbackRate = this.getFallbackRate(from, to);
      this.cache.set(cacheKey, { rate: fallbackRate, timestamp: Date.now() });
      return fallbackRate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return this.getFallbackRate(from, to);
    }
  }

  private getFallbackRate(from: string, to: string): number {
    const rates: Record<string, number> = {
      'USD-EUR': 0.85,
      'USD-GBP': 0.73,
      'USD-JPY': 110.0,
      'USD-CAD': 1.25,
      'USD-AUD': 1.35,
      'USD-INR': 75.0,
      'USD-CNY': 6.5,
      'EUR-USD': 1.18,
      'GBP-USD': 1.37,
      'JPY-USD': 0.009,
      'CAD-USD': 0.80,
      'AUD-USD': 0.74,
      'INR-USD': 0.013,
      'CNY-USD': 0.15,
    };

    return rates[`${from}-${to}`] || 1;
  }

  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    const rate = await this.getExchangeRate(from, to);
    return amount * rate;
  }

  async updateExchangeRates(): Promise<void> {
    try {
      // This would normally call a real exchange rate API
      // For now, we'll just update with mock data
      const rates = [
        { base_currency: 'USD', target_currency: 'EUR', rate: 0.85 },
        { base_currency: 'USD', target_currency: 'GBP', rate: 0.73 },
        { base_currency: 'USD', target_currency: 'JPY', rate: 110.0 },
        { base_currency: 'USD', target_currency: 'CAD', rate: 1.25 },
        { base_currency: 'USD', target_currency: 'AUD', rate: 1.35 },
        { base_currency: 'USD', target_currency: 'INR', rate: 75.0 },
        { base_currency: 'USD', target_currency: 'CNY', rate: 6.5 },
      ];

      for (const rate of rates) {
        await supabase
          .from('exchange_rates')
          .upsert(rate, { onConflict: 'base_currency,target_currency' });
      }

      console.log('Exchange rates updated successfully');
    } catch (error) {
      console.error('Error updating exchange rates:', error);
    }
  }

  getSupportedCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY'];
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}

export const currencyService = new CurrencyService();
