
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

export const organizationService = {
  async createOrganization(name: string, currentUserId: string): Promise<boolean> {
    try {
      console.log("[OrgService] Creating organization:", name, "for user:", currentUserId);
      
      if (!currentUserId) {
        toast.error("You must be logged in to create an organization");
        return false;
      }
      
      if (!name || name.trim().length === 0) {
        toast.error("Organization name is required");
        return false;
      }
      
      // Check if user already has an organization
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', currentUserId)
        .single();
      
      if (existingProfile?.org_id) {
        toast.error("You already belong to an organization");
        return false;
      }
      
      // Use the database function to create organization (avoids RLS issues)
      const { data: orgId, error: orgError } = await supabase
        .rpc('create_organization', { org_name: name.trim() });

      if (orgError) {
        console.error("[OrgService] Organization creation error:", orgError);
        toast.error('Failed to create organization: ' + orgError.message);
        return false;
      }

      console.log("[OrgService] Organization created successfully with ID:", orgId);
      toast.success('Organization created successfully!');
      return true;
    } catch (error) {
      console.error('[OrgService] Error creating organization:', error);
      toast.error('An error occurred while creating the organization');
      return false;
    }
  },

  async checkUserNeedsOrganization(userId: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id, role')
        .eq('id', userId)
        .single();
      
      return profile?.role === 'org_owner' && !profile?.org_id;
    } catch (error) {
      console.error('[OrgService] Error checking if user needs organization:', error);
      return false;
    }
  }
};
