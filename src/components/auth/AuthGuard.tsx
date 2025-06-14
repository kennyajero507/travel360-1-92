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

  // Show loading while auth is being determined (no fancy timeouts)
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
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Profile not present
  if (requireAuth && session && !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-yellow-50">
        <div className="text-xl font-semibold text-yellow-800 mb-3">Account setup issue</div>
        <p className="mb-3">Profile could not be loaded. Please contact support if this keeps happening.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Check role access if roles are specified
  if (requireAuth && session && userProfile && allowedRoles.length > 0) {
    const hasAccess = checkRoleAccess(allowedRoles);
    if (!hasAccess) {
      const redirectPath = userProfile.role === 'system_admin' ? '/admin/dashboard' : '/app/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
