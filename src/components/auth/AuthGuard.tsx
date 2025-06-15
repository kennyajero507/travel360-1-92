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

  // Robust loading: loading or not-yet-fetched session/profile
  if (loading || (session && !profile && !error)) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading account...</p>
          {error && (
            <div className="mt-4 max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    Loading Issue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 mb-3">{error}</p>
                  <Button
                    onClick={repairProfile}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not logged in OR profile couldn't be loaded
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile failed to load and error is set
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
              <p className="text-sm text-gray-600">
                There was a critical issue loading your user profile.
                <br />
                <span className="text-xs text-red-700 block mt-2">{error}</span>
              </p>
              <Button
                onClick={repairProfile}
                className="w-full mt-3"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try to Repair Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Role-based access check (must have profile)
  if (allowedRoles && (!profile || !checkRoleAccess(allowedRoles))) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authenticated with valid profile
  return <>{children}</>;
};

export default AuthGuard;
