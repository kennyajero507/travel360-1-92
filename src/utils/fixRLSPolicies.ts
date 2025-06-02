
import { supabase } from "../integrations/supabase/client";

export const testAuthenticationFlow = async () => {
  try {
    console.log("=== TESTING AUTHENTICATION FLOW ===");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user");
      return false;
    }

    console.log("Testing user:", user.id, user.email);

    // Test profile access with new RLS policies
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, org_id, full_name, email')
      .eq('id', user.id)
      .maybeSingle();

    console.log("Profile result:", profile);
    if (profileError) {
      console.error("Profile error:", profileError);
      return false;
    }

    if (!profile) {
      console.error("No profile found for authenticated user");
      return false;
    }

    // Test organization access if user has org
    if (profile.org_id) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, owner_id')
        .eq('id', profile.org_id)
        .maybeSingle();

      console.log("Organization result:", org);
      if (orgError) {
        console.error("Organization error:", orgError);
      }
    } else {
      console.log("User has no organization assigned");
    }

    console.log("=== AUTHENTICATION FLOW TEST PASSED ===");
    return true;
  } catch (error) {
    console.error("Authentication flow test error:", error);
    return false;
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

    if (profile && !profile.org_id && profile.role === 'org_owner') {
      console.log("Organization owner needs organization - user should create one through UI");
      return false; // Don't auto-create, let user do it manually
    }

    return true;
  } catch (error) {
    console.error("Error checking organization:", error);
    return false;
  }
};

// Remove the old testRLSAccess function since we have a more focused test
export { testAuthenticationFlow as testRLSAccess };
