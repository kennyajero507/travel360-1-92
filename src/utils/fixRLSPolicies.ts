
import { supabase } from "../integrations/supabase/client";

export const testRLSAccess = async () => {
  try {
    console.log("=== TESTING RLS ACCESS ===");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user");
      return;
    }

    console.log("Testing user:", user.id);

    // Test profile access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, org_id, full_name')
      .eq('id', user.id)
      .maybeSingle();

    console.log("Profile result:", profile);
    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // Test organization creation if user has no org
    if (profile && !profile.org_id && profile.role === 'org_owner') {
      console.log("User needs organization - this is expected for new users");
      
      // Try to create organization
      const { data: createOrgResult, error: createOrgError } = await supabase
        .rpc('create_organization', { org_name: 'Test Organization' });
      
      console.log("Create org result:", createOrgResult);
      if (createOrgError) {
        console.error("Create org error:", createOrgError);
      }
    }

    // Test inquiries access
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('id, client_name, status')
      .limit(5);

    console.log("Inquiries result:", inquiries?.length || 0, "rows");
    if (inquiriesError) {
      console.error("Inquiries error:", inquiriesError);
    }

    console.log("=== END RLS TEST ===");
  } catch (error) {
    console.error("RLS test error:", error);
  }
};

// Function to help users create organization if they don't have one
export const ensureUserHasOrganization = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && !profile.org_id && profile.role !== 'system_admin') {
      console.log("User needs organization");
      
      // Create a default organization
      const { data: orgId, error: orgError } = await supabase
        .rpc('create_organization', { org_name: 'My Travel Agency' });

      if (orgError) {
        console.error("Failed to create organization:", orgError);
        return false;
      }

      console.log("Created organization:", orgId);
      return true;
    }

    return true;
  } catch (error) {
    console.error("Error ensuring organization:", error);
    return false;
  }
};
