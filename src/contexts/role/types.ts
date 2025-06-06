
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
}

export type UserRole = 'system_admin' | 'org_owner' | 'tour_operator' | 'agent';

export interface RoleContextType {
  role: UserRole | null;
  permissions: Permissions;
  loading: boolean;
  setRole: (role: UserRole) => void;
}
