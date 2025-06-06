
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export const realDataService = {
  async getQuotes() {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[RealDataService] Error fetching quotes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[RealDataService] Error in getQuotes:', error);
      return [];
    }
  },

  async getInquiries() {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[RealDataService] Error fetching inquiries:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[RealDataService] Error in getInquiries:', error);
      return [];
    }
  },

  async getBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[RealDataService] Error fetching bookings:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[RealDataService] Error in getBookings:', error);
      return [];
    }
  },

  async getHotels() {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[RealDataService] Error fetching hotels:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[RealDataService] Error in getHotels:', error);
      return [];
    }
  },

  async getOrganizationStats(orgId: string) {
    try {
      console.log('[RealDataService] Fetching org stats for:', orgId);
      
      const [quotesResult, inquiriesResult, bookingsResult, hotelsResult] = await Promise.all([
        supabase.from('quotes').select('id, status').eq('created_by', orgId),
        supabase.from('inquiries').select('id, status').eq('created_by', orgId),
        supabase.from('bookings').select('id, status').eq('agent_id', orgId),
        supabase.from('hotels').select('id, status').eq('org_id', orgId)
      ]);

      if (quotesResult.error) console.error('Quotes error:', quotesResult.error);
      if (inquiriesResult.error) console.error('Inquiries error:', inquiriesResult.error);
      if (bookingsResult.error) console.error('Bookings error:', bookingsResult.error);
      if (hotelsResult.error) console.error('Hotels error:', hotelsResult.error);

      return {
        totalQuotes: quotesResult.data?.length || 0,
        totalInquiries: inquiriesResult.data?.length || 0,
        totalBookings: bookingsResult.data?.length || 0,
        totalHotels: hotelsResult.data?.length || 0,
        pendingQuotes: quotesResult.data?.filter(q => q.status === 'draft').length || 0,
        newInquiries: inquiriesResult.data?.filter(i => i.status === 'New').length || 0,
        confirmedBookings: bookingsResult.data?.filter(b => b.status === 'confirmed').length || 0,
        activeHotels: hotelsResult.data?.filter(h => h.status === 'Active').length || 0
      };
    } catch (error) {
      console.error('[RealDataService] Error fetching org stats:', error);
      return {
        totalQuotes: 0,
        totalInquiries: 0,
        totalBookings: 0,
        totalHotels: 0,
        pendingQuotes: 0,
        newInquiries: 0,
        confirmedBookings: 0,
        activeHotels: 0
      };
    }
  }
};
