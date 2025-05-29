
// Helper functions for authentication
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'system_admin':
      return 'System Administrator';
    case 'org_owner':
      return 'Organization Owner';
    case 'tour_operator':
      return 'Tour Operator';
    case 'agent':
      return 'Travel Agent';
    case 'client':
      return 'Client';
    default:
      return 'User';
  }
};

export const getDefaultRedirectPath = (role: string): string => {
  switch (role) {
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

export const validateRole = (role: string): boolean => {
  const validRoles = ['system_admin', 'org_owner', 'tour_operator', 'agent', 'client'];
  return validRoles.includes(role);
};
