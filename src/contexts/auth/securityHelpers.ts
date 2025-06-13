
import { supabase } from '../../integrations/supabase/client';

// Security definer functions to prevent RLS recursion
export const securityHelpers = {
  async getCurrentUserRole(): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_role');
      if (error) {
        console.error('[SecurityHelpers] Error getting user role:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('[SecurityHelpers] Exception getting user role:', error);
      return null;
    }
  },

  async getCurrentUserOrganization(): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_organization');
      if (error) {
        console.error('[SecurityHelpers] Error getting user organization:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('[SecurityHelpers] Exception getting user organization:', error);
      return null;
    }
  },

  async checkSystemAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_system_admin');
      if (error) {
        console.error('[SecurityHelpers] Error checking system admin:', error);
        return false;
      }
      return data || false;
    } catch (error) {
      console.error('[SecurityHelpers] Exception checking system admin:', error);
      return false;
    }
  },

  async checkUserRole(role: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_user_role', { check_role: role });
      if (error) {
        console.error('[SecurityHelpers] Error checking user role:', error);
        return false;
      }
      return data || false;
    } catch (error) {
      console.error('[SecurityHelpers] Exception checking user role:', error);
      return false;
    }
  }
};
