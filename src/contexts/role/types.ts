
export interface Permissions {
  // Core permissions
  canViewDashboard: boolean;
  canManageTeam: boolean;
  canViewSettings: boolean;
  canManageSettings: boolean;
  
  // Inquiry permissions
  canCreateInquiries: boolean;
  canViewInquiries: boolean;
  canEditInquiries: boolean;
  canDeleteInquiries: boolean;
  canAssignInquiries: boolean;
  
  // Quote permissions
  canCreateQuotes: boolean;
  canViewQuotes: boolean;
  canEditQuotes: boolean;
  canDeleteQuotes: boolean;
  canGenerateQuotes: boolean;
  
  // Hotel permissions
  canCreateHotels: boolean;
  canViewHotels: boolean;
  canEditHotels: boolean;
  canDeleteHotels: boolean;
  canAddHotels: boolean;
  canSubmitHotels: boolean;
  
  // Booking permissions
  canCreateBookings: boolean;
  canViewBookings: boolean;
  canEditBookings: boolean;
  canDeleteBookings: boolean;
  
  // Client permissions
  canViewClients: boolean;
  canEditClients: boolean;
  
  // Report permissions
  canViewReports: boolean;
  canExportReports: boolean;
  
  // Agent management permissions
  canManageAgents: boolean;
}

export type UserRole = 'system_admin' | 'org_owner' | 'tour_operator' | 'agent' | 'client';

export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  subscriptionTier: SubscriptionTier;
}

export interface RoleContextType {
  role: UserRole | null;
  permissions: Permissions;
  loading: boolean;
  setRole: (role: UserRole) => void;
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  organization: Organization | undefined;
  setOrganization: (org: Organization) => void;
}
