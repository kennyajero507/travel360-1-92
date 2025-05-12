
// User roles in the system
export type UserRole = 'system_admin' | 'org_owner' | 'tour_operator' | 'agent' | 'client';

// Types of subscription tiers available
export type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

// User with basic information
export interface User {
  id: string;
  name: string;
  email: string;
}

// All possible permissions in the system
export interface Permissions {
  // System management
  canManageAllOrganizations: boolean;
  canConfigureGlobalIntegrations: boolean;
  canSetSecurityPolicies: boolean;
  canViewSystemWideAnalytics: boolean;
  canAccessSystemSettings: boolean;
  
  // Organization management
  canManageTeamMembers: boolean;
  canControlBilling: boolean;
  
  // Hotel management
  canAddHotels: boolean;
  canEditHotels: boolean;
  canApproveHotels: boolean;
  canSubmitHotels: boolean;
  canSetPreferredVendors: boolean;
  canImportExportHotels: boolean;
  
  // Quote management
  canAccessAllCompanyQuotes: boolean;
  canAssignInquiries: boolean;
  canGenerateQuotes: boolean;
  canModifyQuotes: boolean;
  
  // Agent management
  canManageAgents: boolean;
  
  // Analytics
  canViewTeamMetrics: boolean;
  canViewCompanyReports: boolean;
  
  // Client communication
  canCommunicateWithClients: boolean;
}

// The type of the context value returned by useRole
export interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  permissions: Permissions;
}
