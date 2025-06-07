
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
    canAddHotels: false,
    canSubmitHotels: false,
    
    canCreateBookings: false,
    canViewBookings: false,
    canEditBookings: false,
    canDeleteBookings: false,
    
    canViewClients: false,
    canEditClients: false,
    
    canViewReports: false,
    canExportReports: false,
    
    canManageAgents: false,
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
        canAddHotels: true,
        canSubmitHotels: true,
        canCreateBookings: true,
        canViewBookings: true,
        canEditBookings: true,
        canDeleteBookings: true,
        canViewClients: true,
        canEditClients: true,
        canViewReports: true,
        canExportReports: true,
        canManageAgents: true,
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
        canAddHotels: true,
        canSubmitHotels: true,
        canCreateBookings: true,
        canViewBookings: true,
        canEditBookings: true,
        canDeleteBookings: true,
        canViewClients: true,
        canEditClients: true,
        canViewReports: true,
        canExportReports: true,
        canManageAgents: true,
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
        canAddHotels: true,
        canSubmitHotels: true,
        canCreateBookings: true,
        canViewBookings: true,
        canEditBookings: true,
        canDeleteBookings: true,
        canViewClients: true,
        canEditClients: true,
        canViewReports: true,
        canExportReports: true,
        canManageAgents: false, // Will be enabled for pro/enterprise tiers
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
        canAddHotels: true,
        canSubmitHotels: true,
        canCreateBookings: true,
        canViewBookings: true,
        canEditBookings: true,
        canViewClients: true,
        canViewReports: true,
      };

    case 'client':
      return {
        ...basePermissions,
        canViewDashboard: true,
      };

    default:
      return basePermissions;
  }
};

const defaultPermissions = {
  system_admin: getPermissionsForRole('system_admin'),
  org_owner: getPermissionsForRole('org_owner'),
  tour_operator: getPermissionsForRole('tour_operator'),
  agent: getPermissionsForRole('agent'),
  client: getPermissionsForRole('client'),
};

export default defaultPermissions;
