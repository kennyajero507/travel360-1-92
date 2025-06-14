
// Re-export everything from the main AuthContext for backward compatibility
export { useAuth as useRole, AuthProvider as RoleProvider } from '../AuthContext';
export * from './defaultPermissions';
export * from './types';
