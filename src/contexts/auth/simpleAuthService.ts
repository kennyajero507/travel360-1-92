
import { supabase } from '../../integrations/supabase/client';

export const simpleAuthService = {
  async signUp(email: string, password: string, fullName: string, role: string = 'org_owner', companyName?: string) {
    console.log('[SimpleAuthService] Starting signup for:', email);
    
    const redirectUrl = `${window.location.origin}/login`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role,
          company_name: companyName,
        }
      },
    });

    if (error) {
      console.error('[SimpleAuthService] Signup error:', error);
      throw error;
    }

    console.log('[SimpleAuthService] Signup successful:', data.user?.id);
    return data;
  },

  async signIn(email: string, password: string) {
    console.log('[SimpleAuthService] Starting signin for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('[SimpleAuthService] Signin error:', error);
      throw error;
    }

    console.log('[SimpleAuthService] Signin successful:', data.user.id);
    return data;
  },

  async signOut() {
    console.log('[SimpleAuthService] Starting signout');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[SimpleAuthService] Signout error:', error);
      throw error;
    }

    console.log('[SimpleAuthService] Signout successful');
  },

  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[SimpleAuthService] Session error:', error);
      return null;
    }

    return data.session;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('[SimpleAuthService] User error:', error);
      return null;
    }

    return data.user;
  }
};
