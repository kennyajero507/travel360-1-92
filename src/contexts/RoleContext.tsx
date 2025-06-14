
// Backward compatibility - re-export everything from AuthContext
export { useAuth as useRole, AuthProvider as RoleProvider } from './AuthContext';
export * from './role/types';
export * from './role/defaultPermissions';
