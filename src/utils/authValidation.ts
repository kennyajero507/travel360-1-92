
import { UserProfile } from '../contexts/auth/types';

export const validateUserAccess = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) {
    console.log('[AuthValidation] No user profile found');
    return false;
  }

  if (!userProfile.org_id && userProfile.role === 'org_owner') {
    console.log('[AuthValidation] Org owner without organization - needs setup');
    return false;
  }

  if (!userProfile.org_id && userProfile.role !== 'system_admin') {
    console.log('[AuthValidation] User without organization (non-admin)');
    return false;
  }

  return true;
};

export const getRedirectPath = (userProfile: UserProfile | null): string => {
  if (!userProfile) return '/login';
  
  if (userProfile.role === 'system_admin') {
    return '/admin/dashboard';
  }
  
  if (userProfile.role === 'org_owner' && !userProfile.org_id) {
    return '/'; // Will show org setup
  }
  
  return '/dashboard';
};

export const needsOrganizationSetup = (userProfile: UserProfile | null): boolean => {
  return userProfile?.role === 'org_owner' && !userProfile.org_id;
};
