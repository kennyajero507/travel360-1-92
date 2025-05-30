
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

export const authService = {
  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log("Attempting login for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        console.log("Login successful");
        toast.success('Logged in successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  },

  async signup(email: string, password: string, fullName: string, companyName: string): Promise<boolean> {
    try {
      console.log("Starting signup process for organization owner:", email);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            role: 'org_owner' // Explicitly set role as org_owner
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        
        if (error.message.includes('already registered') || 
            error.message.includes('User already registered')) {
          toast.error("This email is already registered. Please use a different email or try signing in.");
          return false;
        }
        
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        // Create organization after user is created
        if (data.user.email_confirmed_at || !data.user.email_confirmed_at) {
          // Wait a moment for the user profile to be created by the trigger
          setTimeout(async () => {
            try {
              await this.createOrganizationForNewUser(companyName, data.user!.id);
            } catch (orgError) {
              console.error('Error creating organization:', orgError);
              // Don't fail the signup if organization creation fails
            }
          }, 1000);
        }
        
        if (data.user.email_confirmed_at) {
          toast.success("Organization account created successfully! You can now sign in as the organization owner.");
        } else {
          toast.success("Please check your email to confirm your account before signing in.");
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
      return false;
    }
  },

  async createOrganizationForNewUser(companyName: string, userId: string): Promise<void> {
    try {
      console.log("Creating organization for new organization owner:", companyName);
      
      const { data, error } = await supabase
        .rpc('create_organization', { org_name: companyName });

      if (error) {
        console.error("Organization creation error:", error);
        throw error;
      }

      console.log("Organization created with ID:", data);

      // Update organization with owner_id
      await supabase
        .from('organizations')
        .update({ owner_id: userId })
        .eq('id', data);
      
      // Update user profile to link to organization (role should already be org_owner from trigger)
      await supabase
        .from('profiles')
        .update({ 
          org_id: data 
        })
        .eq('id', userId);
        
      console.log("User profile updated and linked to organization");
    } catch (error) {
      console.error('Error in createOrganizationForNewUser:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  },

  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Password reset email sent. Please check your inbox.');
      return true;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      toast.error('An error occurred during password reset');
      return false;
    }
  },

  async updatePassword(password: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      toast.error('An error occurred while updating password');
      return false;
    }
  }
};
