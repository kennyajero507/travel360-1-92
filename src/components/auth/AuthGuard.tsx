
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { session, loading, checkRoleAccess, error, profile, repairProfile } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!session) {
    console.log('[AuthGuard] No session, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile loading error
  if (!profile && error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Profile Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                There was an issue loading your user profile.
              </p>
              <p className="text-xs text-red-700 mb-4">{error}</p>
              <Button
                onClick={repairProfile}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Session exists but no profile yet - show loading
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Role-based access check
  if (allowedRoles && !checkRoleAccess(allowedRoles)) {
    console.log('[AuthGuard] Role access denied:', { userRole: profile.role, allowedRoles });
    return <Navigate to="/dashboard" replace />;
  }

  // All good - render children
  return <>{children}</>;
};

export default AuthGuard;
