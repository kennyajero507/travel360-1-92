
import defaultPermissions, { getPermissionsForRole } from "../role/defaultPermissions";

export const roleService = {
  getPermissionsForRole,
  getDefaultPermissions: () => defaultPermissions["org_owner"],

  checkRoleAccess(role: string | null, roles: string[]) {
    return role ? roles.includes(role) : false;
  },

  hasPermission(permissions: any, perm: string) {
    return Boolean(permissions?.[perm]);
  },
};
