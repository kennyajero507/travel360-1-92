
import React, { createContext, useState, useEffect } from 'react';
import { UserRole, SubscriptionTier, RoleContextType, User, Permissions } from './types';
import defaultPermissions from './defaultPermissions';

// Create the context with a default undefined value and proper type
export const RoleContext = createContext<RoleContextType | undefined>(undefined);

/**
 * Provider component for role-based functionality and permissions
 */
export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('agent');
  const [tier, setTier] = useState<SubscriptionTier>('basic');
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions.agent);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-123',
    name: 'James Smith',
    email: 'james.smith@example.com'
  });

  // Update permissions when role or tier changes
  useEffect(() => {
    // Start with default permissions for the role
    let updatedPermissions = {...defaultPermissions[role]};
    
    // Apply tier-specific permissions for tour operators
    if (role === 'tour_operator') {
      // Only pro and enterprise tier tour operators can manage agents
      updatedPermissions.canManageAgents = (tier === 'pro' || tier === 'enterprise');
      
      // All tour operators can add hotels regardless of tier
      updatedPermissions.canAddHotels = true;
    }
    
    // Apply tier-specific permissions for agents
    if (role === 'agent') {
      // Agents in pro and enterprise tiers might have additional permissions
      if (tier === 'pro' || tier === 'enterprise') {
        updatedPermissions.canAddHotels = true; // Pro/enterprise agents can add hotels directly
      } else {
        // Basic tier agents can also add hotels now
        updatedPermissions.canAddHotels = true;
      }
    }
    
    setPermissions(updatedPermissions);
  }, [role, tier]);

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (role === 'system_admin') return true; // System admin has all permissions
    
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
    currentUser,
    setCurrentUser
  };

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};
