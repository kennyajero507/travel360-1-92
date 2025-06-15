
import { supabase } from '../integrations/supabase/client';

export const createSuperAdminAccount = async () => {
  const superAdminEmail = 'admin@travelflow360.com';
  const superAdminPassword = 'SuperAdmin2024!';
  
  try {
    // First, try to sign up the admin user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: superAdminEmail,
      password: superAdminPassword,
      options: {
        data: {
          full_name: 'System Administrator',
          role: 'system_admin'
        }
      }
    });

    if (signUpError && signUpError.message !== 'User already registered') {
      throw signUpError;
    }

    // If user already exists, try to update their profile
    if (signUpError?.message === 'User already registered') {
      console.log('Admin user already exists, checking profile...');
      
      // Sign in to get the user ID
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: superAdminEmail,
        password: superAdminPassword
      });

      if (signInError) {
        console.error('Could not sign in admin user:', signInError);
        return {
          success: false,
          message: 'Admin user exists but could not sign in. Please check credentials.',
          credentials: { email: superAdminEmail, password: superAdminPassword }
        };
      }

      if (signInData.user) {
        // Update profile to ensure admin role
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: signInData.user.id,
            email: superAdminEmail,
            full_name: 'System Administrator',
            role: 'system_admin'
          });

        if (updateError) {
          console.error('Could not update admin profile:', updateError);
        }

        await supabase.auth.signOut();
      }
    }

    return {
      success: true,
      message: 'Super admin account created/updated successfully',
      credentials: {
        email: superAdminEmail,
        password: superAdminPassword
      }
    };

  } catch (error) {
    console.error('Error creating super admin account:', error);
    return {
      success: false,
      message: `Failed to create super admin account: ${error.message}`,
      credentials: { email: superAdminEmail, password: superAdminPassword }
    };
  }
};

// Export credentials for easy access
export const SUPER_ADMIN_CREDENTIALS = {
  email: 'admin@travelflow360.com',
  password: 'SuperAdmin2024!'
};
