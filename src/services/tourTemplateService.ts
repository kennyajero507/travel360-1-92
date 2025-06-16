
import { supabase } from '../integrations/supabase/client';
import { TourTemplate, TourTemplateFormData } from '../types/tour.types';

export class TourTemplateService {
  async getAllTourTemplates(): Promise<TourTemplate[]> {
    const { data, error } = await supabase
      .from('tour_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as TourTemplate[];
  }

  async getTourTemplate(id: string): Promise<TourTemplate | null> {
    const { data, error } = await supabase
      .from('tour_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as TourTemplate | null;
  }

  async createTourTemplate(tourTemplate: TourTemplateFormData): Promise<TourTemplate> {
    const { data, error } = await supabase
      .from('tour_templates')
      .insert([{
        ...tourTemplate,
        itinerary: tourTemplate.itinerary as any,
        inclusions: tourTemplate.inclusions as any,
        exclusions: tourTemplate.exclusions as any,
        images: tourTemplate.images as any,
        tags: tourTemplate.tags as any
      }])
      .select()
      .single();

    if (error) throw error;
    return data as TourTemplate;
  }

  async updateTourTemplate(id: string, tourTemplate: Partial<TourTemplateFormData>): Promise<TourTemplate> {
    const updateData: any = { ...tourTemplate };
    
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
    return data as TourTemplate;
  }

  async deleteTourTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('tour_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  async duplicateTourTemplate(id: string, newTitle: string): Promise<TourTemplate> {
    const original = await this.getTourTemplate(id);
    if (!original) throw new Error('Tour template not found');

    const { id: _, created_at, updated_at, created_by, org_id, ...templateData } = original;
    
    const duplicatedTemplate = {
      ...templateData,
      title: newTitle
    };

    return this.createTourTemplate(duplicatedTemplate);
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

export const tourTemplateService = new TourTemplateService();
