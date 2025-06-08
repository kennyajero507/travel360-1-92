
import { UserProfile } from '../contexts/auth/types';

export const getRedirectPath = (userProfile: UserProfile): string => {
  if (!userProfile) return '/login';
  
  switch (userProfile.role) {
    case 'system_admin':
      return '/admin/dashboard';
    case 'org_owner':
    case 'tour_operator':
    case 'agent':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

export const validateUserAccess = (userProfile: UserProfile | null, requiredRoles: string[]): boolean => {
  if (!userProfile) return false;
  
  // System admins have access to everything
  if (userProfile.role === 'system_admin') return true;
  
  // Check if user's role is in the required roles
  return requiredRoles.includes(userProfile.role);
};

export const canAccessAdminArea = (userProfile: UserProfile | null): boolean => {
  return userProfile?.role === 'system_admin';
};

export const canManageOrganization = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) return false;
  return ['system_admin', 'org_owner'].includes(userProfile.role);
};

export const canManageTeam = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) return false;
  return ['system_admin', 'org_owner', 'tour_operator'].includes(userProfile.role);
};

export const requiresOrganization = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) return false;
  return userProfile.role === 'org_owner' && !userProfile.org_id;
};
