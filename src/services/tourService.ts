
import { supabase } from '../integrations/supabase/client';
import { Tour, TourFormData } from '../types/tour.types';

export class TourService {
  async getAllTours(): Promise<Tour[]> {
    const { data, error } = await supabase
      .from('tour_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.convertToTour);
  }

  async getTour(id: string): Promise<Tour | null> {
    const { data, error } = await supabase
      .from('tour_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? this.convertToTour(data) : null;
  }

  async createTour(tour: TourFormData): Promise<Tour> {
    const { data, error } = await supabase
      .from('tour_templates')
      .insert([{
        ...tour,
        itinerary: tour.itinerary as any,
        inclusions: tour.inclusions as any,
        exclusions: tour.exclusions as any,
        images: tour.images as any,
        tags: tour.tags as any
      }])
      .select()
      .single();

    if (error) throw error;
    return this.convertToTour(data);
  }

  async updateTour(id: string, tour: Partial<TourFormData>): Promise<Tour> {
    const updateData: any = { ...tour };
    
    // Convert arrays to Json for Supabase
    if (updateData.itinerary) {
      updateData.itinerary = updateData.itinerary as any;
    }
    if (updateData.inclusions) {
      updateData.inclusions = updateData.inclusions as any;
    }
    if (updateData.exclusions) {
      updateData.exclusions = updateData.exclusions as any;
    }
    if (updateData.images) {
      updateData.images = updateData.images as any;
    }
    if (updateData.tags) {
      updateData.tags = updateData.tags as any;
    }

    const { data, error } = await supabase
      .from('tour_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.convertToTour(data);
  }

  async deleteTour(id: string): Promise<void> {
    const { error } = await supabase
      .from('tour_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  async duplicateTour(id: string, newTitle: string): Promise<Tour> {
    const original = await this.getTour(id);
    if (!original) throw new Error('Tour not found');

    const { id: _, created_at, updated_at, created_by, org_id, ...tourData } = original;
    
    const duplicatedTour = {
      ...tourData,
      title: newTitle
    };

    return this.createTour(duplicatedTour);
  }

  private convertToTour(data: any): Tour {
    return {
      ...data,
      itinerary: Array.isArray(data.itinerary) ? data.itinerary : [],
      inclusions: Array.isArray(data.inclusions) ? data.inclusions : [],
      exclusions: Array.isArray(data.exclusions) ? data.exclusions : [],
      images: Array.isArray(data.images) ? data.images : [],
      tags: Array.isArray(data.tags) ? data.tags : []
    } as Tour;
  }

  // Kenya-specific regions for domestic tours
  getKenyaRegions(): string[] {
    return [
      'Nairobi',
      'Mombasa',
      'Maasai Mara',
      'Amboseli',
      'Tsavo East',
      'Tsavo West',
      'Lake Nakuru',
      'Lake Naivasha',
      'Samburu',
      'Aberdares',
      'Mt. Kenya',
      'Lamu',
      'Malindi',
      'Watamu',
      'Diani',
      'Nyeri',
      'Meru'
    ];
  }

  // Common tour tags
  getTourTags(): string[] {
    return [
      'wildlife',
      'safari',
      'beach',
      'honeymoon',
      'adventure',
      'cultural',
      'luxury',
      'budget',
      'family',
      'group',
      'photography',
      'birding',
      'hiking',
      'camping',
      'lodge'
    ];
  }
}

export const tourService = new TourService();
