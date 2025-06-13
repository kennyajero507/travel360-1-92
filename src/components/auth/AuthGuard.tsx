
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../common/LoadingStates';

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

  console.log('[AuthGuard] State:', { 
    loading, 
    hasSession: !!session, 
    hasProfile: !!userProfile,
    currentPath: location.pathname,
    userRole: userProfile?.role 
  });

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-slate-600 mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !session) {
    console.log('[AuthGuard] No session, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but profile is missing or incomplete
  if (requireAuth && session && !userProfile) {
    console.log('[AuthGuard] Session exists but no profile, showing error');
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Profile Setup Required</h3>
            <p className="text-red-600 mb-4">
              Your account needs to be set up properly. Please contact support or try logging out and back in.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated and has profile, check role access
  if (requireAuth && session && userProfile && allowedRoles.length > 0) {
    const hasAccess = checkRoleAccess(allowedRoles);
    console.log('[AuthGuard] Role check:', { 
      userRole: userProfile.role, 
      allowedRoles, 
      hasAccess 
    });
    
    if (!hasAccess) {
      // Redirect based on user role
      const redirectPath = userProfile.role === 'system_admin' ? '/admin/dashboard' : '/app/dashboard';
      console.log('[AuthGuard] Access denied, redirecting to:', redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
  }

  console.log('[AuthGuard] Access granted, rendering children');
  return <>{children}</>;
};

export default AuthGuard;
