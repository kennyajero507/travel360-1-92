
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
      
      // Check current user profile state with detailed logging
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('org_id, role, full_name, email')
        .eq('id', currentUserId)
        .single();
      
      console.log("[OrgService] Current profile state:", existingProfile);
      
      if (profileError) {
        console.error("[OrgService] Error fetching profile:", profileError);
        toast.error("Error checking user profile: " + profileError.message);
        return false;
      }
      
      if (existingProfile?.org_id) {
        console.log("[OrgService] User already has org_id:", existingProfile.org_id);
        toast.error("You already belong to an organization");
        return false;
      }
      
      // Create organization directly instead of using the function to avoid the error
      console.log("[OrgService] Creating new organization...");
      
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: name.trim(),
          owner_id: currentUserId,
          created_at: new Date().toISOString(),
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single();

      if (orgError) {
        console.error("[OrgService] Organization creation error:", orgError);
        toast.error('Failed to create organization: ' + orgError.message);
        return false;
      }

      console.log("[OrgService] Organization created:", newOrg);

      // Update user profile with organization
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          org_id: newOrg.id,
          role: 'org_owner'
        })
        .eq('id', currentUserId);

      if (updateError) {
        console.error("[OrgService] Profile update error:", updateError);
        toast.error('Failed to update profile: ' + updateError.message);
        return false;
      }

      console.log("[OrgService] Organization created successfully with ID:", newOrg.id);
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
      
      console.log("[OrgService] User profile check:", profile);
      return profile?.role === 'org_owner' && !profile?.org_id;
    } catch (error) {
      console.error('[OrgService] Error checking if user needs organization:', error);
      return false;
    }
  }
};
