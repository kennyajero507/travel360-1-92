
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
        emailRedirectTo: `${window.location.origin}/`,
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
      
      // Ensure System Administration organization exists
      const { data: existingOrg, error: orgSelectError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', 'System Administration')
        .maybeSingle();

      let orgId = existingOrg?.id;

      if (!orgId) {
        console.log('Creating System Administration organization...');
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
          throw orgError;
        } else {
          orgId = newOrg?.id;
          console.log('System Administration organization created:', orgId);
        }
      }

      // Create or update the admin profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          full_name: 'System Administrator',
          role: 'system_admin',
          org_id: orgId,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      console.log('Admin profile created/updated successfully');

      // Update the organization owner if needed
      if (orgId) {
        const { error: updateOrgError } = await supabase
          .from('organizations')
          .update({ owner_id: userId })
          .eq('id', orgId);

        if (updateOrgError) {
          console.error('Organization update error:', updateOrgError);
        }
      }

      // Sign out after setup
      await supabase.auth.signOut();
    }

    return {
      success: true,
      message: 'Super admin account created/updated successfully',
      credentials: SUPER_ADMIN_CREDENTIALS
    };

  } catch (error: any) {
    console.error('Error creating super admin account:', error);
    return {
      success: false,
      message: `Failed to create super admin account: ${error.message}`,
      credentials: SUPER_ADMIN_CREDENTIALS
    };
  }
};
