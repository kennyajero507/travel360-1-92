
import { useContext } from 'react';
import { RoleContext } from './RoleProvider';
import { RoleContextType } from './types';

/**
 * Hook to access the role context throughout the application
 * @returns The role context value
 */
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
