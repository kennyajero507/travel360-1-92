
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
      
      // Test inquiries access
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('count(*)')
        .single();
      
      console.log("Inquiries access:", inquiries);
      console.log("Inquiries error:", inquiriesError);
      
      // Test quotes access
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('count(*)')
        .single();
      
      console.log("Quotes access:", quotes);
      console.log("Quotes error:", quotesError);
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
