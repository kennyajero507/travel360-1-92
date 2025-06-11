
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

// Service for Quote Accommodations
export const quoteAccommodationService = {
  async getByQuoteId(quoteId: string) {
    const { data, error } = await supabase
      .from('quote_accommodations')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching accommodations:', error);
      throw error;
    }
    return data || [];
  },

  async create(accommodation: any) {
    const { data, error } = await supabase
      .from('quote_accommodations')
      .insert([accommodation])
      .select()
      .single();

    if (error) {
      console.error('Error creating accommodation:', error);
      toast.error('Failed to add accommodation');
      throw error;
    }
    return data;
  },

  async update(id: string, accommodation: any) {
    const { data, error } = await supabase
      .from('quote_accommodations')
      .update(accommodation)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating accommodation:', error);
      toast.error('Failed to update accommodation');
      throw error;
    }
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('quote_accommodations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting accommodation:', error);
      toast.error('Failed to delete accommodation');
      throw error;
    }
  }
};

// Service for Quote Transport
export const quoteTransportService = {
  async getByQuoteId(quoteId: string) {
    const { data, error } = await supabase
      .from('quote_transport')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching transport:', error);
      throw error;
    }
    return data || [];
  },

  async create(transport: any) {
    const { data, error } = await supabase
      .from('quote_transport')
      .insert([transport])
      .select()
      .single();

    if (error) {
      console.error('Error creating transport:', error);
      toast.error('Failed to add transport');
      throw error;
    }
    return data;
  },

  async update(id: string, transport: any) {
    const { data, error } = await supabase
      .from('quote_transport')
      .update(transport)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transport:', error);
      toast.error('Failed to update transport');
      throw error;
    }
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('quote_transport')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transport:', error);
      toast.error('Failed to delete transport');
      throw error;
    }
  }
};

// Service for Quote Transfers
export const quoteTransferService = {
  async getByQuoteId(quoteId: string) {
    const { data, error } = await supabase
      .from('quote_transfers_new')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching transfers:', error);
      throw error;
    }
    return data || [];
  },

  async create(transfer: any) {
    const { data, error } = await supabase
      .from('quote_transfers_new')
      .insert([transfer])
      .select()
      .single();

    if (error) {
      console.error('Error creating transfer:', error);
      toast.error('Failed to add transfer');
      throw error;
    }
    return data;
  },

  async update(id: string, transfer: any) {
    const { data, error } = await supabase
      .from('quote_transfers_new')
      .update(transfer)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transfer:', error);
      toast.error('Failed to update transfer');
      throw error;
    }
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('quote_transfers_new')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transfer:', error);
      toast.error('Failed to delete transfer');
      throw error;
    }
  }
};

// Service for Quote Excursions
export const quoteExcursionService = {
  async getByQuoteId(quoteId: string) {
    const { data, error } = await supabase
      .from('quote_excursions')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching excursions:', error);
      throw error;
    }
    return data || [];
  },

  async create(excursion: any) {
    const { data, error } = await supabase
      .from('quote_excursions')
      .insert([excursion])
      .select()
      .single();

    if (error) {
      console.error('Error creating excursion:', error);
      toast.error('Failed to add excursion');
      throw error;
    }
    return data;
  },

  async update(id: string, excursion: any) {
    const { data, error } = await supabase
      .from('quote_excursions')
      .update(excursion)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating excursion:', error);
      toast.error('Failed to update excursion');
      throw error;
    }
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('quote_excursions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting excursion:', error);
      toast.error('Failed to delete excursion');
      throw error;
    }
  }
};

// Service for Quote Markup
export const quoteMarkupService = {
  async getByQuoteId(quoteId: string) {
    const { data, error } = await supabase
      .from('quote_markup')
      .select('*')
      .eq('quote_id', quoteId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching markup:', error);
      throw error;
    }
    return data;
  },

  async createOrUpdate(quoteId: string, markup: any) {
    const existing = await this.getByQuoteId(quoteId);
    
    if (existing) {
      const { data, error } = await supabase
        .from('quote_markup')
        .update({ ...markup, updated_at: new Date().toISOString() })
        .eq('quote_id', quoteId)
        .select()
        .single();

      if (error) {
        console.error('Error updating markup:', error);
        toast.error('Failed to update markup');
        throw error;
      }
      return data;
    } else {
      const { data, error } = await supabase
        .from('quote_markup')
        .insert([{ ...markup, quote_id: quoteId }])
        .select()
        .single();

      if (error) {
        console.error('Error creating markup:', error);
        toast.error('Failed to create markup');
        throw error;
      }
      return data;
    }
  }
};

// Service to get quote summary
export const quoteSummaryService = {
  async getCalculatedSummary(quoteId: string) {
    const { data, error } = await supabase
      .rpc('calculate_quote_summary', { quote_id_param: quoteId });

    if (error) {
      console.error('Error calculating quote summary:', error);
      throw error;
    }
    return data;
  },

  async getCachedSummary(quoteId: string) {
    const { data, error } = await supabase
      .from('quotes')
      .select('summary_data')
      .eq('id', quoteId)
      .single();

    if (error) {
      console.error('Error fetching cached summary:', error);
      throw error;
    }
    return data?.summary_data || {};
  }
};
