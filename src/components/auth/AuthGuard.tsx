
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { session, loading, checkRoleAccess, error, profile, repairProfile, debugAuth } = useAuth();
  const location = useLocation();
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleDebug = async () => {
    const info = await debugAuth();
    setDebugInfo(info);
    setShowDebug(true);
  };

  // Enhanced loading with better UX
  if (loading || (session && !profile && !error)) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading your account...</h3>
          <p className="text-slate-600 text-sm">
            Setting up your workspace and profile
          </p>
          
          {error && (
            <Card className="mt-4 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  Loading Issue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-3">{error}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={repairProfile}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                  <Button
                    onClick={handleDebug}
                    size="sm"
                    variant="ghost"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile failed to load with enhanced error UI
  if (!profile && error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Profile Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800 font-medium mb-1">
                Account Setup Issue
              </p>
              <p className="text-xs text-red-700">
                {error}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={repairProfile}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Set Up Profile
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={handleDebug}
                  variant="ghost"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showDebug && debugInfo && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-gray-500 mb-2">
                  Debug Information
                </summary>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Role-based access check
  if (allowedRoles && (!profile || !checkRoleAccess(allowedRoles))) {
    return <Navigate to="/dashboard" replace />;
  }

  // Success: render children
  return <>{children}</>;
};

export default AuthGuard;
