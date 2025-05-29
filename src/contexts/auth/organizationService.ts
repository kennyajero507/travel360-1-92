
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

export const organizationService = {
  async createOrganization(name: string, currentUserId: string): Promise<boolean> {
    try {
      console.log("Creating organization:", name);
      
      if (!currentUserId) {
        toast.error("You must be logged in to create an organization");
        return false;
      }
      
      const { data, error } = await supabase
        .rpc('create_organization', { org_name: name });

      if (error) {
        console.error("Organization creation error:", error);
        toast.error('Failed to create organization: ' + error.message);
        return false;
      }

      console.log("Organization created with ID:", data);

      // Update organization with owner_id
      await supabase
        .from('organizations')
        .update({ owner_id: currentUserId })
        .eq('id', data);
      
      return true;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('An error occurred while creating the organization');
      return false;
    }
  }
};
