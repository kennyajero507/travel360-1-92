
import { Permissions, UserRole } from './types';

export const getPermissionsForRole = (role: UserRole): Permissions => {
  const basePermissions: Permissions = {
    canViewDashboard: false,
    canManageTeam: false,
    canViewSettings: false,
    canManageSettings: false,
    
    canCreateInquiries: false,
    canViewInquiries: false,
    canEditInquiries: false,
    canDeleteInquiries: false,
    canAssignInquiries: false,
    
    canCreateQuotes: false,
    canViewQuotes: false,
    canEditQuotes: false,
    canDeleteQuotes: false,
    canGenerateQuotes: false,
    
    canCreateHotels: false,
    canViewHotels: false,
    canEditHotels: false,
    canDeleteHotels: false,
    
    canCreateBookings: false,
    canViewBookings: false,
    canEditBookings: false,
    canDeleteBookings: false,
    
    canViewClients: false,
    canEditClients: false,
    
    canViewReports: false,
    canExportReports: false,
  };

  switch (role) {
    case 'system_admin':
      return {
        ...basePermissions,
        canViewDashboard: true,
        canManageTeam: true,
        canViewSettings: true,
        canManageSettings: true,
        canCreateInquiries: true,
        canViewInquiries: true,
        canEditInquiries: true,
        canDeleteInquiries: true,
        canAssignInquiries: true,
        canCreateQuotes: true,
        canViewQuotes: true,
        canEditQuotes: true,
        canDeleteQuotes: true,
        canGenerateQuotes: true,
        canCreateHotels: true,
        canViewHotels: true,
        canEditHotels: true,
        canDeleteHotels: true,
        canCreateBookings: true,
        canViewBookings: true,
        canEditBookings: true,
        canDeleteBookings: true,
        canViewClients: true,
        canEditClients: true,
        canViewReports: true,
        canExportReports: true,
      };

    case 'org_owner':
      return {
        ...basePermissions,
        canViewDashboard: true,
        canManageTeam: true,
        canViewSettings: true,
        canManageSettings: true,
        canCreateInquiries: true,
        canViewInquiries: true,
        canEditInquiries: true,
        canDeleteInquiries: true,
        canAssignInquiries: true,
        canCreateQuotes: true,
        canViewQuotes: true,
        canEditQuotes: true,
        canDeleteQuotes: true,
        canGenerateQuotes: true,
        canCreateHotels: true,
        canViewHotels: true,
        canEditHotels: true,
        canDeleteHotels: true,
        canCreateBookings: true,
        canViewBookings: true,
        canEditBookings: true,
        canDeleteBookings: true,
        canViewClients: true,
        canEditClients: true,
        canViewReports: true,
        canExportReports: true,
      };

    case 'tour_operator':
      return {
        ...basePermissions,
        canViewDashboard: true,
        canViewSettings: true,
        canCreateInquiries: true,
        canViewInquiries: true,
        canEditInquiries: true,
        canDeleteInquiries: true,
        canAssignInquiries: true,
        canCreateQuotes: true,
        canViewQuotes: true,
        canEditQuotes: true,
        canDeleteQuotes: true,
        canGenerateQuotes: true,
        canCreateHotels: true,
        canViewHotels: true,
        canEditHotels: true,
        canDeleteHotels: true,
        canCreateBookings: true,
        canViewBookings: true,
        canEditBookings: true,
        canDeleteBookings: true,
        canViewClients: true,
        canEditClients: true,
        canViewReports: true,
        canExportReports: true,
      };

    case 'agent':
      return {
        ...basePermissions,
        canViewDashboard: true,
        canCreateInquiries: true,
        canViewInquiries: true,
        canEditInquiries: true,
        canCreateQuotes: true,
        canViewQuotes: true,
        canEditQuotes: true,
        canGenerateQuotes: true,
        canViewHotels: true,
        canCreateBookings: true,
        canViewBookings: true,
        canEditBookings: true,
        canViewClients: true,
        canViewReports: true,
      };

    default:
      return basePermissions;
  }
};
