
import { supabase } from "../integrations/supabase/client";

export const debugRLSStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("=== RLS DEBUG INFO ===");
    console.log("Current user:", user?.id);
    
    if (user) {
      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log("User profile:", profile);
      console.log("Profile error:", profileError);
      
      // Test inquiries access with simpler query
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('id')
        .limit(1);
      
      console.log("Inquiries access test:", inquiries?.length || 0, "rows");
      console.log("Inquiries error:", inquiriesError);
      
      // Test quotes access with simpler query
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id')
        .limit(1);
      
      console.log("Quotes access test:", quotes?.length || 0, "rows");
      console.log("Quotes error:", quotesError);

      // Test organization access
      if (profile?.org_id) {
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('id', profile.org_id)
          .single();
        
        console.log("Organization access:", org);
        console.log("Organization error:", orgError);
      }
    }
    console.log("=== END RLS DEBUG ===");
  } catch (error) {
    console.error("RLS Debug error:", error);
  }
};

// Auto-run on module load for debugging
if (typeof window !== 'undefined') {
  debugRLSStatus();
}
