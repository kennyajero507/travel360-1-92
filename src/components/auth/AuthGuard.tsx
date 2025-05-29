
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export const AuthGuard = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: AuthGuardProps) => {
  const { session, userProfile, loading, checkRoleAccess } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && (!session || !userProfile)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but doesn't have required role
  if (requireAuth && session && userProfile && allowedRoles.length > 0) {
    const hasAccess = checkRoleAccess(allowedRoles);
    if (!hasAccess) {
      // Redirect based on user role
      const redirectPath = userProfile.role === 'system_admin' ? '/admin/dashboard' : '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
