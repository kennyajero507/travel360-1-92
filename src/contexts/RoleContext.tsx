
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'agent' | 'operator' | 'admin';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  tier: 'basic' | 'pro' | 'enterprise';
  setTier: (tier: 'basic' | 'pro' | 'enterprise') => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  permissions: {
    canEditUsers: boolean;
    canManageBilling: boolean;
    canAccessSystemSettings: boolean;
    canEditAllQuotes: boolean;
    canAssignInquiries: boolean;
    canViewAnalytics: boolean;
    canManageContentPages: boolean;
    canCreateRoles: boolean;
  };
}

const defaultPermissions = {
  agent: {
    canEditUsers: false,
    canManageBilling: false,
    canAccessSystemSettings: false,
    canEditAllQuotes: false,
    canAssignInquiries: false,
    canViewAnalytics: false,
    canManageContentPages: false,
    canCreateRoles: false,
  },
  operator: {
    canEditUsers: false,
    canManageBilling: false,
    canAccessSystemSettings: false,
    canEditAllQuotes: true,
    canAssignInquiries: true,
    canViewAnalytics: true,
    canManageContentPages: false,
    canCreateRoles: false,
  },
  admin: {
    canEditUsers: true,
    canManageBilling: true,
    canAccessSystemSettings: true,
    canEditAllQuotes: true,
    canAssignInquiries: true,
    canViewAnalytics: true,
    canManageContentPages: true,
    canCreateRoles: true,
  }
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('agent');
  const [tier, setTier] = useState<'basic' | 'pro' | 'enterprise'>('basic');
  const [permissions, setPermissions] = useState(defaultPermissions.agent);

  // Update permissions when role changes
  useEffect(() => {
    setPermissions(defaultPermissions[role]);
  }, [role]);

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (role === 'admin') return true; // Admin has all permissions
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    
    return role === requiredRole;
  };

  const contextValue: RoleContextType = {
    role,
    setRole,
    tier,
    setTier,
    hasPermission,
    permissions,
  };

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
