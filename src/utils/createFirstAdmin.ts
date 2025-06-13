
import { supabase } from "../integrations/supabase/client";

/**
 * Creates the first system admin account
 * This should be run once to bootstrap the admin system
 */
export async function createFirstAdmin() {
  try {
    console.log("Creating first admin account...");
    
    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@travelflow360.com',
      password: 'TravelFlow2024!',
      options: {
        data: {
          full_name: 'System Administrator'
        }
      }
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log("Admin user already exists, updating role...");
        
        // Get existing user by email
        const { data: users, error: getUserError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', 'admin@travelflow360.com')
          .single();
          
        if (getUserError) throw getUserError;
        
        // Update existing user role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'system_admin' })
          .eq('id', users.id);
          
        if (updateError) throw updateError;
        
        console.log("✅ Existing admin user role updated successfully!");
        return { success: true, existed: true };
      }
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error("Failed to create user");
    }
    
    console.log("✅ Admin user created:", authData.user.id);
    
    // Update user profile to system_admin role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'system_admin' })
      .eq('id', authData.user.id);
    
    if (updateError) throw updateError;
    
    console.log("✅ Admin account created successfully!");
    console.log("📧 Email: admin@travelflow360.com");
    console.log("🔑 Password: TravelFlow2024!");
    console.log("🌐 Login at: /admin/login");
    
    return {
      success: true,
      userId: authData.user.id,
      credentials: {
        email: 'admin@travelflow360.com',
        password: 'TravelFlow2024!'
      }
    };
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Run this in the browser console to create the first admin:
 * 
 * 1. Open browser console (F12)
 * 2. Run: 
 * 
 * import('/src/utils/createFirstAdmin.js').then(module => {
 *   module.createFirstAdmin().then(result => console.log(result));
 * });
 */
