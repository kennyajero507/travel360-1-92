
import { supabase } from '../../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from './types';

export const authService = {
  async signIn(email: string, password: string) {
    console.log('[AuthService] Attempting login for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    
    if (error) {
      console.error('[AuthService] Login error:', error);
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
    
    return data;
  },

  async signUp(email: string, password: string, options?: {
    fullName?: string;
    role?: string;
    companyName?: string;
  }) {
    console.log('[AuthService] Attempting signup for:', email);
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    const redirectUrl = `${window.location.origin}/login`;
    
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
      console.error('[AuthService] Signup error:', error);
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

    return data;
  },

  async signOut() {
    console.log('[AuthService] Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[AuthService] Logout error:', error);
      throw error;
    }
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[AuthService] Session error:', error);
      throw error;
    }
    return session;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
