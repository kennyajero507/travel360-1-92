
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { auditService } from '../../services/auditService';
import { systemErrorHandler } from '../../services/systemErrorHandler';

class EnhancedAuthService {
  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log('[EnhancedAuthService] Starting login process for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('[EnhancedAuthService] Login error:', error);
        
        await systemErrorHandler.handleError({
          code: 'AUTH_FAILED',
          message: `Login failed: ${error.message}`,
          context: { email, errorCode: error.status },
          severity: 'medium'
        });

        return false;
      }

      if (data.user) {
        console.log('[EnhancedAuthService] Login successful');
        
        // Log successful authentication
        await auditService.logUserActivity(
          'user_login',
          'User successfully logged in',
          { email, loginTime: new Date().toISOString() }
        );

        toast.success('Successfully signed in');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[EnhancedAuthService] Unexpected login error:', error);
      
      await systemErrorHandler.handleError({
        code: 'AUTH_FAILED',
        message: error instanceof Error ? error.message : 'Unknown login error',
        context: { email },
        severity: 'high'
      });

      return false;
    }
  }

  async signup(email: string, password: string, fullName: string, companyName: string): Promise<boolean> {
    try {
      console.log('[EnhancedAuthService] Starting signup process for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName
          }
        }
      });

      if (error) {
        console.error('[EnhancedAuthService] Signup error:', error);
        
        await systemErrorHandler.handleError({
          code: 'SIGNUP_FAILED',
          message: `Signup failed: ${error.message}`,
          context: { email, errorCode: error.status },
          severity: 'medium'
        });

        return false;
      }

      if (data.user) {
        console.log('[EnhancedAuthService] Signup successful');
        
        // Log successful signup
        await auditService.logUserActivity(
          'user_signup',
          'User successfully signed up',
          { email, fullName, companyName, signupTime: new Date().toISOString() }
        );

        if (data.user.email_confirmed_at) {
          toast.success('Account created successfully!');
        } else {
          toast.success('Account created! Please check your email to confirm your account.');
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('[EnhancedAuthService] Unexpected signup error:', error);
      
      await systemErrorHandler.handleError({
        code: 'SIGNUP_FAILED',
        message: error instanceof Error ? error.message : 'Unknown signup error',
        context: { email, fullName, companyName },
        severity: 'high'
      });

      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('[EnhancedAuthService] Starting logout process');
      
      // Log logout activity before signing out
      await auditService.logUserActivity(
        'user_logout',
        'User logged out',
        { logoutTime: new Date().toISOString() }
      );

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[EnhancedAuthService] Logout error:', error);
        
        await systemErrorHandler.handleError({
          code: 'LOGOUT_FAILED',
          message: `Logout failed: ${error.message}`,
          severity: 'low'
        });

        toast.error('Failed to sign out properly');
      } else {
        console.log('[EnhancedAuthService] Logout successful');
        toast.success('Signed out successfully');
      }
    } catch (error) {
      console.error('[EnhancedAuthService] Unexpected logout error:', error);
      
      await systemErrorHandler.handleError({
        code: 'LOGOUT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown logout error',
        severity: 'medium'
      });

      toast.error('An error occurred during sign out');
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      console.log('[EnhancedAuthService] Starting password reset for:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('[EnhancedAuthService] Password reset error:', error);
        
        await systemErrorHandler.handleError({
          code: 'PASSWORD_RESET_FAILED',
          message: `Password reset failed: ${error.message}`,
          context: { email },
          severity: 'medium'
        });

        return false;
      }

      // Log password reset request
      await auditService.logUserActivity(
        'password_reset_request',
        'Password reset email requested',
        { email, requestTime: new Date().toISOString() }
      );

      toast.success('Password reset email sent');
      return true;
    } catch (error) {
      console.error('[EnhancedAuthService] Unexpected password reset error:', error);
      
      await systemErrorHandler.handleError({
        code: 'PASSWORD_RESET_FAILED',
        message: error instanceof Error ? error.message : 'Unknown password reset error',
        context: { email },
        severity: 'high'
      });

      return false;
    }
  }

  async updatePassword(password: string): Promise<boolean> {
    try {
      console.log('[EnhancedAuthService] Starting password update');

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('[EnhancedAuthService] Password update error:', error);
        
        await systemErrorHandler.handleError({
          code: 'PASSWORD_UPDATE_FAILED',
          message: `Password update failed: ${error.message}`,
          severity: 'medium'
        });

        return false;
      }

      // Log password update
      await auditService.logUserActivity(
        'password_updated',
        'User password updated successfully',
        { updateTime: new Date().toISOString() }
      );

      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      console.error('[EnhancedAuthService] Unexpected password update error:', error);
      
      await systemErrorHandler.handleError({
        code: 'PASSWORD_UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown password update error',
        severity: 'high'
      });

      return false;
    }
  }

  async checkAccountSecurity(): Promise<{
    hasStrongPassword: boolean;
    hasRecentActivity: boolean;
    accountAge: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get recent user activities
      const recentActivities = await auditService.getUserActivities(
        user.id,
        ['user_login'],
        10
      );

      const accountCreated = new Date(user.created_at);
      const now = new Date();
      const accountAge = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

      return {
        hasStrongPassword: true, // We can't check this directly
        hasRecentActivity: recentActivities.length > 0,
        accountAge
      };
    } catch (error) {
      await systemErrorHandler.handleError({
        code: 'SECURITY_CHECK_FAILED',
        message: error instanceof Error ? error.message : 'Failed to check account security',
        severity: 'low'
      });

      return {
        hasStrongPassword: false,
        hasRecentActivity: false,
        accountAge: 0
      };
    }
  }
}

export const enhancedAuthService = new EnhancedAuthService();
