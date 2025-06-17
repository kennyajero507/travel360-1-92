
import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencyService } from '../services/currencyService';

interface CountryContextType {
  country: string;
  setCountry: (country: string) => void;
  regions: string[];
  currency: string;
  getCurrencyForCountry: (countryCode: string) => string;
  getRegionsForCountry: (countryCode: string) => string[];
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

const COUNTRY_SETTINGS = {
  'Kenya': {
    currency: 'KES',
    regions: [
      'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
      'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
      'Embu', 'Migori', 'Homa Bay', 'Naivasha', 'Nanyuki', 'Diani Beach',
      'Watamu', 'Lamu', 'Amboseli', 'Maasai Mara', 'Tsavo East', 'Tsavo West',
      'Samburu', 'Mount Kenya', 'Aberdare', 'Lake Nakuru'
    ]
  },
  'Tanzania': {
    currency: 'TZS',
    regions: [
      'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar', 'Kilimanjaro',
      'Serengeti', 'Ngorongoro', 'Tarangire', 'Lake Manyara', 'Ruaha', 'Selous'
    ]
  },
  'Uganda': {
    currency: 'UGX',
    regions: [
      'Kampala', 'Entebbe', 'Jinja', 'Gulu', 'Mbarara', 'Queen Elizabeth',
      'Bwindi', 'Kibale', 'Murchison Falls', 'Lake Mburo'
    ]
  }
};

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountry] = useState<string>('Kenya');

  const getCurrencyForCountry = (countryCode: string): string => {
    return COUNTRY_SETTINGS[countryCode as keyof typeof COUNTRY_SETTINGS]?.currency || 'KES';
  };

  const getRegionsForCountry = (countryCode: string): string[] => {
    return COUNTRY_SETTINGS[countryCode as keyof typeof COUNTRY_SETTINGS]?.regions || COUNTRY_SETTINGS.Kenya.regions;
  };

  const regions = getRegionsForCountry(country);
  const currency = getCurrencyForCountry(country);

  const value = {
    country,
    setCountry,
    regions,
    currency,
    getCurrencyForCountry,
    getRegionsForCountry
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};
