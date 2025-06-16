
export interface Permission {
  action: string;
  resource: string;
}

export interface RolePermissions {
  [key: string]: boolean;
}

export const roleService = {
  getDefaultPermissions(): RolePermissions {
    return {
      'read:own_profile': true,
      'update:own_profile': true,
    };
  },

  getPermissionsForRole(role: string): RolePermissions {
    const basePermissions = this.getDefaultPermissions();

    switch (role) {
      case 'system_admin':
        return {
          ...basePermissions,
          'read:all_users': true,
          'create:organizations': true,
          'delete:organizations': true,
          'update:any_profile': true,
          'read:system_logs': true,
          'manage:system_settings': true,
        };
      
      case 'org_owner':
        return {
          ...basePermissions,
          'read:organization': true,
          'update:organization': true,
          'invite:users': true,
          'manage:team': true,
          'create:quotes': true,
          'create:bookings': true,
          'view:reports': true,
        };
      
      case 'tour_operator':
        return {
          ...basePermissions,
          'create:quotes': true,
          'create:bookings': true,
          'read:organization': true,
          'invite:agents': true,
        };
      
      case 'agent':
        return {
          ...basePermissions,
          'create:inquiries': true,
          'view:assigned_quotes': true,
          'update:assigned_bookings': true,
        };
      
      default:
        return basePermissions;
    }
  },

  checkRoleAccess(userRole: string | null, allowedRoles: string[]): boolean {
    if (!userRole) return false;
    
    // System admin has access to everything
    if (userRole === 'system_admin') return true;
    
    return allowedRoles.includes(userRole);
  },

  hasPermission(permissions: RolePermissions, permission: string): boolean {
    return Boolean(permissions[permission]);
  }
};
