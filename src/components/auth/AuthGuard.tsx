
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

  // Set timeout to prevent infinite loading - reduced to 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('[AuthGuard] Loading timeout reached, forcing continuation');
        setTimeoutReached(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Show loading while auth is being determined (with timeout)
  if (loading && !timeoutReached) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-slate-600 mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Handle timeout case - treat as not authenticated
  if (timeoutReached && loading) {
    console.log('[AuthGuard] Timeout reached, treating as not authenticated');
    if (requireAuth) {
      return <Navigate to="/signin" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !session) {
    console.log('[AuthGuard] No session, redirecting to signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated but profile is missing - redirect to signin
  if (requireAuth && session && !userProfile) {
    console.log('[AuthGuard] Session exists but no profile, redirecting to signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check role access if roles are specified
  if (requireAuth && session && userProfile && allowedRoles.length > 0) {
    const hasAccess = checkRoleAccess(allowedRoles);
    console.log('[AuthGuard] Role check:', { 
      userRole: userProfile.role, 
      allowedRoles, 
      hasAccess 
    });
    
    if (!hasAccess) {
      const redirectPath = userProfile.role === 'system_admin' ? '/admin/dashboard' : '/app/dashboard';
      console.log('[AuthGuard] Access denied, redirecting to:', redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
  }

  console.log('[AuthGuard] Access granted, rendering children');
  return <>{children}</>;
};

export default AuthGuard;
