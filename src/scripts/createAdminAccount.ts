
// This is a utility script, run manually to create an admin account
import { supabase } from "../integrations/supabase/client";

// You can run this from the browser console for development purposes
export async function createAdminAccount(email: string, password: string, fullName: string) {
  try {
    // 1. Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error("Failed to create user");
    }
    
    console.log("User created:", authData.user.id);
    
    // 2. Update user profile to system_admin role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'system_admin' })
      .eq('id', authData.user.id);
    
    if (updateError) throw updateError;
    
    console.log("Admin account created successfully!");
    return {
      success: true,
      userId: authData.user.id
    };
  } catch (error) {
    console.error("Error creating admin account:", error);
    return {
      success: false,
      error
    };
  }
}

// Usage example (run in browser console):
// import { createAdminAccount } from './scripts/createAdminAccount';
// createAdminAccount('admin@example.com', 'securepassword', 'System Admin');
