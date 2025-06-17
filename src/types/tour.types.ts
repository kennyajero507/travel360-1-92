
export interface Tour {
  id: string;
  title: string;
  destination_name: string;
  country: string;
  region?: string;
  duration_days: number;
  duration_nights: number;
  tour_type: 'domestic' | 'international';
  description?: string;
  inclusions: string[];
  exclusions: string[];
  base_price?: number;
  currency_code: string;
  itinerary: ItineraryDay[];
  images: string[];
  tags: string[];
  is_active: boolean;
  created_by?: string;
  org_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  location?: string;
  meals: string[];
  transport?: string;
  activities: string[];
}

export interface TourFormData {
  title: string;
  destination_name: string;
  country: string;
  region?: string;
  duration_days: number;
  duration_nights: number;
  tour_type: 'domestic' | 'international';
  description?: string;
  inclusions: string[];
  exclusions: string[];
  base_price?: number;
  currency_code: string;
  itinerary: ItineraryDay[];
  images: string[];
  tags: string[];
}

// Backward compatibility
export type TourTemplate = Tour;
export type TourTemplateFormData = TourFormData;
