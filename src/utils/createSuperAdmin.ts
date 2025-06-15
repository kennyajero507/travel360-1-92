
import { supabase } from '../integrations/supabase/client';

// Updated super admin credentials
export const SUPER_ADMIN_CREDENTIALS = {
  email: 'admin@travelflow360.com',
  password: 'TravelFlow360Admin2024!'
};

export const createSuperAdminAccount = async () => {
  const { email, password } = SUPER_ADMIN_CREDENTIALS;
  
  try {
    console.log('Creating super admin account...');
    
    // First, try to sign up the admin user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: 'System Administrator',
          role: 'system_admin'
        }
      }
    });

    if (signUpError && signUpError.message !== 'User already registered') {
      console.error('SignUp error:', signUpError);
      throw signUpError;
    }

    let userId = signUpData?.user?.id;

    // If user already exists, try to sign in to get the user ID
    if (signUpError?.message === 'User already registered') {
      console.log('Admin user already exists, attempting to sign in...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (signInError) {
        console.error('SignIn error:', signInError);
        return {
          success: false,
          message: 'Admin user exists but could not sign in. Please check credentials.',
          credentials: SUPER_ADMIN_CREDENTIALS
        };
      }

      userId = signInData.user?.id;
    }

    if (userId) {
      console.log('User ID obtained:', userId);
      
      // Create or update the admin profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          full_name: 'System Administrator',
          role: 'system_admin',
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      // Create a system organization if it doesn't exist
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', 'System Administration')
        .single();

      let orgId = existingOrg?.id;

      if (!orgId) {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: 'System Administration',
            owner_id: userId
          })
          .select('id')
          .single();

        if (orgError) {
          console.error('Organization creation error:', orgError);
        } else {
          orgId = newOrg?.id;
        }
      }

      // Update the profile with the organization ID
      if (orgId) {
        await supabase
          .from('profiles')
          .update({ org_id: orgId })
          .eq('id', userId);
      }

      // Sign out after setup
      await supabase.auth.signOut();
    }

    return {
      success: true,
      message: 'Super admin account created/updated successfully',
      credentials: SUPER_ADMIN_CREDENTIALS
    };

  } catch (error) {
    console.error('Error creating super admin account:', error);
    return {
      success: false,
      message: `Failed to create super admin account: ${error.message}`,
      credentials: SUPER_ADMIN_CREDENTIALS
    };
  }
};
