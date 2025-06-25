
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { session, loading, checkRoleAccess, error, profile, repairProfile } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Handle loading timeout
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  // Enhanced loading state with progress indicator
  if (loading && !loadingTimeout) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-teal-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Checking authentication...
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            Setting up your secure session
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading timeout - offer recovery options
  if (loading && loadingTimeout) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Clock className="h-5 w-5" />
              Authentication Timeout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Authentication is taking longer than expected. This might be due to a slow connection or server load.
            </p>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setLoadingTimeout(false);
                  setRetryCount(prev => prev + 1);
                  window.location.reload();
                }}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Authentication
              </Button>
              
              <Button
                onClick={() => {
                  window.location.href = '/login';
                }}
                variant="outline"
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
            
            {retryCount > 0 && (
              <div className="text-xs text-gray-500 text-center">
                Retry attempts: {retryCount}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!session) {
    console.log('[AuthGuard] No session, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile loading error with enhanced recovery options
  if (!profile && error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Profile Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                There was an issue loading your user profile.
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-700 font-mono">{error}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={repairProfile}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Repair Profile
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
              
              <Button
                onClick={async () => {
                  await fetch('/api/auth/signout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                variant="ghost"
                className="w-full text-gray-500"
              >
                Sign Out & Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session exists but no profile yet - enhanced loading with status
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <CheckCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Setting up your profile...
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Authenticated
              </Badge>
            </div>
            
            <p className="text-slate-500 text-sm">
              Loading your workspace and permissions
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
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
