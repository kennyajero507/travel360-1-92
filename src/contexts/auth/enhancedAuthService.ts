
import { supabase } from '../../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export const enhancedAuthService = {
  async signIn(email: string, password: string) {
    console.log('[EnhancedAuthService] Attempting login for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      
      if (error) {
        console.error('[EnhancedAuthService] Login error:', error);
        let errorMessage = 'Login failed';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later';
        }
        
        throw new Error(errorMessage);
      }
      
      console.log('[EnhancedAuthService] Login successful');
      return data;
    } catch (error) {
      console.error('[EnhancedAuthService] Sign in failed:', error);
      throw error;
    }
  },

  async signUp(email: string, password: string, options?: {
    fullName?: string;
    role?: string;
    companyName?: string;
  }) {
    console.log('[EnhancedAuthService] Attempting signup for:', email);
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    const redirectUrl = `${window.location.origin}/login`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: options?.fullName || email.split('@')[0],
            role: options?.role || 'org_owner',
            company_name: options?.companyName,
          }
        },
      });
      
      if (error) {
        console.error('[EnhancedAuthService] Signup error:', error);
        let errorMessage = 'Registration failed';
        
        if (error.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'Password is too weak. Please use a stronger password';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address';
        }
        
        throw new Error(errorMessage);
      }

      console.log('[EnhancedAuthService] Signup successful');
      return data;
    } catch (error) {
      console.error('[EnhancedAuthService] Sign up failed:', error);
      throw error;
    }
  },

  async signOut() {
    console.log('[EnhancedAuthService] Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[EnhancedAuthService] Logout error:', error);
        throw error;
      }
      console.log('[EnhancedAuthService] Logout successful');
    } catch (error) {
      console.error('[EnhancedAuthService] Sign out failed:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[EnhancedAuthService] Session error:', error);
        throw error;
      }
      return session;
    } catch (error) {
      console.error('[EnhancedAuthService] Get session failed:', error);
      throw error;
    }
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
