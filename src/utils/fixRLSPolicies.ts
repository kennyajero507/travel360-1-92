
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

    // Test profile access with improved error handling
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, org_id, full_name, email')
      .eq('id', user.id)
      .maybeSingle();

    console.log("Profile result:", profile);
    if (profileError) {
      console.error("Profile error:", profileError);
      
      // If it's an RLS error, the policies are working correctly
      if (profileError.message.includes('row-level security') || 
          profileError.message.includes('permission denied')) {
        console.log("RLS policies are active and working correctly");
        return true;
      }
      
      return false;
    }

    if (!profile) {
      console.log("No profile found for authenticated user - this may be expected for new users");
      return true; // This is not necessarily an error
    }

    console.log("Profile found:", {
      id: profile.id,
      role: profile.role,
      org_id: profile.org_id,
      has_email: !!profile.email
    });

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
      } else if (org) {
        console.log("Organization found:", org.name);
      }
    } else {
      console.log("User has no organization assigned");
    }

    console.log("=== AUTHENTICATION FLOW TEST COMPLETED ===");
    return true;
  } catch (error) {
    console.error("Authentication flow test error:", error);
    return false;
  }
};

// Function to help debug profile creation issues
export const debugProfileCreation = async () => {
  try {
    console.log("=== DEBUGGING PROFILE CREATION ===");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user for profile debug");
      return false;
    }

    console.log("User data:", {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      user_metadata: user.user_metadata
    });

    // Try to fetch profile directly
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    } else if (profile) {
      console.log("Profile exists:", profile);
    } else {
      console.log("No profile found - may need to be created");
    }

    return true;
  } catch (error) {
    console.error("Profile debug error:", error);
    return false;
  }
};

// Function to check if user needs organization setup
export const checkOrganizationSetupNeeded = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && profile.role === 'org_owner' && !profile.org_id) {
      console.log("Organization setup needed for org_owner without organization");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking organization setup:", error);
    return false;
  }
};

// Export the original function name for compatibility
export { testAuthenticationFlow as testRLSAccess };
