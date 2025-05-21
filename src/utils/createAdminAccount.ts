
import { supabase } from "../integrations/supabase/client";

/**
 * Creates an admin account with system_admin privileges
 * Run this function from your browser console to create an admin account
 * 
 * Example usage:
 * 1. Import the function: 
 *    import { createAdminAccount } from './utils/createAdminAccount';
 * 2. Call the function with your desired admin email and password:
 *    createAdminAccount('admin@example.com', 'securepassword', 'Admin Name');
 */
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

/**
 * How to use this from the browser console:
 * 
 * 1. Open your application in the browser
 * 2. Open the browser's developer console (F12 or right-click > Inspect > Console)
 * 3. Run the following code:
 * 
 * import('/src/utils/createAdminAccount.js').then(module => {
 *   module.createAdminAccount('admin@example.com', 'securepassword', 'System Admin')
 *     .then(result => console.log(result));
 * });
 * 
 * 4. Check your database to confirm the user was created with system_admin role
 * 5. You can now log in using the admin account credentials at /admin-login
 */
