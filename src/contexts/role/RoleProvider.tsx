import React, { createContext, useState, useEffect } from 'react';
import { UserRole, SubscriptionTier, RoleContextType, User, Permissions, Organization } from './types';
import { getPermissionsForRole } from './defaultPermissions';
import { useAuth } from '../AuthContext';

// Create the context with a default undefined value and proper type
export const RoleContext = createContext<RoleContextType | undefined>(undefined);

/**
 * Provider component for role-based functionality and permissions
 */
export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading: authLoading } = useAuth();
  
  const role = profile?.role as UserRole;

  // Tier is still locally managed for now. This should ideally come from organization subscription data.
  const [tier, setTier] = useState<SubscriptionTier>('starter'); 
  const [permissions, setPermissions] = useState<Permissions>(getPermissionsForRole(role || 'agent'));

  const currentUser: User | undefined = profile ? {
    id: profile.id,
    name: profile.full_name || 'Anonymous',
    email: profile.email || ''
  } : undefined;

  const organization: Organization | undefined = profile?.org_id 
    ? { id: profile.org_id, name: 'Organization' /* Placeholder name */ } 
    : undefined;

  // Update permissions when role or tier changes
  useEffect(() => {
    if (!role) {
      setPermissions(getPermissionsForRole('agent')); // default permissions if no role (e.g. logged out)
      return;
    }
    // Start with default permissions for the role
    let updatedPermissions = {...getPermissionsForRole(role)};
    
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
    
    // Organization owners have additional permissions
    if (role === 'org_owner') {
      updatedPermissions.canManageAgents = true;
      
      // Pro and enterprise tiers get additional permissions
      if (tier === 'pro' || tier === 'enterprise') {
        updatedPermissions.canViewReports = true;
      }
    }
    
    // System admins always have full permissions regardless of tier
    if (role === 'system_admin') {
      Object.keys(updatedPermissions).forEach(key => {
        updatedPermissions[key as keyof Permissions] = true;
      });
    }
    
    setPermissions(updatedPermissions);
  }, [role, tier]);

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    if (role === 'system_admin') return true; // System admin has all permissions
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    
    return role === requiredRole;
  };

  const contextValue: RoleContextType = {
    role: role || 'agent',
    setRole: () => console.warn("Cannot set role directly. It is derived from authentication state."),
    tier,
    setTier,
    hasPermission,
    permissions,
    currentUser: currentUser || { id: '', name: 'Guest', email: '' },
    setCurrentUser: () => console.warn("Cannot set user directly."),
    organization,
    setOrganization: () => console.warn("Cannot set organization directly."),
    loading: authLoading
  };

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};
