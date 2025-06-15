
import { supabase } from "../../integrations/supabase/client";

export const organizationService = {
  async loadOrganization(org_id: string | null) {
    if (!org_id) return null;
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", org_id)
      .maybeSingle();
    if (error) {
      return null;
    }
    return data;
  },

  async createOrganization(orgName: string, userId: string) {
    const { data, error } = await supabase
      .from("organizations")
      .insert([{ name: orgName, owner_id: userId }])
      .select()
      .single();
    if (error || !data) {
      throw new Error(error?.message || "Failed to create organization.");
    }
    return data;
  },

  async linkProfileToOrganization(orgId: string, userId: string) {
    const { error } = await supabase
      .from("profiles")
      .update({
        org_id: orgId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message || "Failed to link profile with organization.");
  },

  async sendInvitation(email: string, invitedRole: string, orgId: string) {
    const { error } = await supabase
      .from("invitations")
      .insert({
        email,
        role: invitedRole,
        org_id: orgId,
      });
    if (error) throw new Error(error.message || "Failed to send invitation.");
  },

  async getInvitations(orgId: string) {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },
};
