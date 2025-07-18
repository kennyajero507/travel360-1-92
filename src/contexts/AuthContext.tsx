// Bridge component to maintain compatibility with existing code
// All components should eventually migrate to useSimpleAuth directly

import { useSimpleAuth } from './SimpleAuthContext';

// Re-export SimpleAuth as the main Auth
export const useAuth = () => {
  const context = useSimpleAuth();
  
  // Create a bridge object that maps old auth methods to new ones
  return {
    // Core auth state
    session: context.session,
    user: context.user,
    profile: context.profile,
    loading: context.loading,
    isLoading: context.loading,
    error: context.error,
    
    // Auth methods with proper signatures
    login: async (email: string, password: string) => {
      return await context.signIn(email, password);
    },
    logout: async () => {
      await context.signOut();
    },
    signup: async (email: string, password: string, fullName?: string, role?: string, companyName?: string) => {
      return await context.signUp(email, password, fullName || 'User', role, companyName);
    },
    
    // Profile methods
    refreshProfile: context.refreshProfile,
    updateProfile: async (updates: any) => {
      return await context.updateProfile(updates);
    },
    repairProfile: async () => {
      // Simple repair by refreshing profile
      await context.refreshProfile();
    },
    
    // Role/Permission methods
    checkRoleAccess: (roles: string[]) => {
      if (!context.profile) return false;
      return roles.includes(context.profile.role);
    },
    hasPermission: (permission: string) => {
      return context.hasPermission(permission);
    },
    
    // Legacy properties for compatibility
    role: context.profile?.role || null,
    permissions: {
      canViewReports: context.profile?.role === 'system_admin' || context.profile?.role === 'org_owner',
      canManageAgents: context.profile?.role === 'system_admin' || context.profile?.role === 'org_owner',
    },
    tier: 'basic',
    organization: context.profile?.org_id ? { id: context.profile.org_id } : null,
    
    // Stub methods for organization functionality with proper signatures
    createOrganization: async (orgName: string) => {
      console.warn('[AuthContext Bridge] createOrganization not implemented in SimpleAuth');
      return false;
    },
    sendInvitation: async (email: string, role: string) => {
      console.warn('[AuthContext Bridge] sendInvitation not implemented in SimpleAuth');
      return false;
    },
    getInvitations: async () => {
      console.warn('[AuthContext Bridge] getInvitations not implemented in SimpleAuth');
      return [];
    },
    acceptInvitation: async (token: string) => {
      console.warn('[AuthContext Bridge] acceptInvitation not implemented in SimpleAuth');
      return false;
    },
    setTier: (tier: string) => {
      console.warn('[AuthContext Bridge] setTier not implemented in SimpleAuth');
    },
    
    // Debug
    debugAuth: context.debugAuth,
  };
};

// Re-export the provider from SimpleAuth
export { SimpleAuthProvider as AuthProvider } from './SimpleAuthContext';
export { SimpleAuthProvider as AuthContextProvider } from './SimpleAuthContext';