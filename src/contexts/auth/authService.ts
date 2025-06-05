
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
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            company_name: companyName,
            role: 'org_owner'
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
