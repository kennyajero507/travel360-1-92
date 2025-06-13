
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../common/LoadingStates';
import { useState, useEffect } from 'react';

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
  const [timeoutReached, setTimeoutReached] = useState(false);

  console.log('[AuthGuard] State:', { 
    loading, 
    hasSession: !!session, 
    hasProfile: !!userProfile,
    currentPath: location.pathname,
    userRole: userProfile?.role,
    timeoutReached
  });

  // Set timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('[AuthGuard] Loading timeout reached, forcing continuation');
        setTimeoutReached(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Show loading while auth is being determined (with timeout)
  if (loading && !timeoutReached) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-slate-600 mt-4">Checking authentication...</p>
          <p className="text-slate-400 text-sm mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // Handle timeout case - treat as not authenticated
  if (timeoutReached && loading) {
    console.log('[AuthGuard] Timeout reached, treating as not authenticated');
    if (requireAuth) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // For non-auth required routes, continue anyway
    return <>{children}</>;
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !session) {
    console.log('[AuthGuard] No session, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but profile is missing or incomplete - try to recover
  if (requireAuth && session && !userProfile) {
    console.log('[AuthGuard] Session exists but no profile, showing recovery options');
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Profile Setup Required</h3>
            <p className="text-yellow-600 mb-4">
              Your account needs to be set up properly. We're working on completing your profile.
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 mr-2"
              >
                Retry
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Back to Login
              </button>
            </div>
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
