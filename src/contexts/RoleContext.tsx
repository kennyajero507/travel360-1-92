
import React, { createContext, useContext, useState, useEffect } from 'react';

// Updated user roles to match the new structure
export type UserRole = 'system_admin' | 'org_owner' | 'tour_operator' | 'agent' | 'client';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  tier: 'basic' | 'pro' | 'enterprise';
  setTier: (tier: 'basic' | 'pro' | 'enterprise') => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  permissions: {
    // System management
    canManageAllOrganizations: boolean;
    canConfigureGlobalIntegrations: boolean;
    canSetSecurityPolicies: boolean;
    canViewSystemWideAnalytics: boolean;
    canAccessSystemSettings: boolean;
    
    // Organization management
    canManageTeamMembers: boolean;
    canControlBilling: boolean;
    
    // Hotel management
    canAddHotels: boolean;
    canEditHotels: boolean;
    canApproveHotels: boolean;
    canSubmitHotels: boolean;
    canSetPreferredVendors: boolean;
    canImportExportHotels: boolean;
    
    // Quote management
    canAccessAllCompanyQuotes: boolean;
    canAssignInquiries: boolean;
    canGenerateQuotes: boolean;
    canModifyQuotes: boolean;
    
    // Agent management
    canManageAgents: boolean;
    
    // Analytics
    canViewTeamMetrics: boolean;
    canViewCompanyReports: boolean;
    
    // Client communication
    canCommunicateWithClients: boolean;
  };
}

const defaultPermissions = {
  system_admin: {
    // System admin has all permissions
    canManageAllOrganizations: true,
    canConfigureGlobalIntegrations: true,
    canSetSecurityPolicies: true,
    canViewSystemWideAnalytics: true,
    canAccessSystemSettings: true,
    canManageTeamMembers: true,
    canControlBilling: true,
    canAddHotels: true,
    canEditHotels: true,
    canApproveHotels: true,
    canSubmitHotels: true,
    canSetPreferredVendors: true,
    canImportExportHotels: true,
    canAccessAllCompanyQuotes: true,
    canAssignInquiries: true,
    canGenerateQuotes: true,
    canModifyQuotes: true,
    canManageAgents: true,
    canViewTeamMetrics: true,
    canViewCompanyReports: true,
    canCommunicateWithClients: true,
  },
  
  org_owner: {
    canManageAllOrganizations: false,
    canConfigureGlobalIntegrations: false,
    canSetSecurityPolicies: false,
    canViewSystemWideAnalytics: false,
    canAccessSystemSettings: false,
    canManageTeamMembers: true,
    canControlBilling: true,
    canAddHotels: true,
    canEditHotels: true,
    canApproveHotels: true,
    canSubmitHotels: true,
    canSetPreferredVendors: true,
    canImportExportHotels: true,
    canAccessAllCompanyQuotes: true,
    canAssignInquiries: true,
    canGenerateQuotes: true,
    canModifyQuotes: true,
    canManageAgents: true,
    canViewTeamMetrics: true,
    canViewCompanyReports: true,
    canCommunicateWithClients: true,
  },
  
  tour_operator: {
    canManageAllOrganizations: false,
    canConfigureGlobalIntegrations: false,
    canSetSecurityPolicies: false,
    canViewSystemWideAnalytics: false,
    canAccessSystemSettings: false,
    canManageTeamMembers: false,
    canControlBilling: false,
    canAddHotels: true, // Updated to allow tour operators to add hotels
    canEditHotels: true,
    canApproveHotels: true,
    canSubmitHotels: true,
    canSetPreferredVendors: true,
    canImportExportHotels: false,
    canAccessAllCompanyQuotes: false,
    canAssignInquiries: true,
    canGenerateQuotes: true,
    canModifyQuotes: true,
    canManageAgents: true, // Tour operators can manage agents
    canViewTeamMetrics: true,
    canViewCompanyReports: false,
    canCommunicateWithClients: true,
  },
  
  agent: {
    canManageAllOrganizations: false,
    canConfigureGlobalIntegrations: false,
    canSetSecurityPolicies: false,
    canViewSystemWideAnalytics: false,
    canAccessSystemSettings: false,
    canManageTeamMembers: false,
    canControlBilling: false,
    canAddHotels: true, // Updated to allow agents to add hotels
    canEditHotels: false,
    canApproveHotels: false,
    canSubmitHotels: true,
    canSetPreferredVendors: false,
    canImportExportHotels: false,
    canAccessAllCompanyQuotes: false,
    canAssignInquiries: false,
    canGenerateQuotes: true,
    canModifyQuotes: true,
    canManageAgents: false,
    canViewTeamMetrics: false,
    canViewCompanyReports: false,
    canCommunicateWithClients: true,
  },
  
  client: {
    canManageAllOrganizations: false,
    canConfigureGlobalIntegrations: false,
    canSetSecurityPolicies: false,
    canViewSystemWideAnalytics: false,
    canAccessSystemSettings: false,
    canManageTeamMembers: false,
    canControlBilling: false,
    canAddHotels: false,
    canEditHotels: false,
    canApproveHotels: false,
    canSubmitHotels: false,
    canSetPreferredVendors: false,
    canImportExportHotels: false,
    canAccessAllCompanyQuotes: false,
    canAssignInquiries: false,
    canGenerateQuotes: false,
    canModifyQuotes: false,
    canManageAgents: false,
    canViewTeamMetrics: false,
    canViewCompanyReports: false,
    canCommunicateWithClients: true,
  }
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('agent');
  const [tier, setTier] = useState<'basic' | 'pro' | 'enterprise'>('basic');
  const [permissions, setPermissions] = useState(defaultPermissions.agent);

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
