
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
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
  const { session, loading, error, profile, debugAuth } = useSimpleAuth();
  const location = useLocation();
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleDebug = async () => {
    const info = await debugAuth();
    setDebugInfo(info);
    setShowDebug(true);
  };

  // Simplified loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading your account...</h3>
          <p className="text-slate-600 text-sm">
            Setting up your workspace and profile
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile failed to load with simplified error UI
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
                onClick={() => window.location.reload()}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading Profile
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
  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  // Success: render children
  return <>{children}</>;
};

export default AuthGuard;
