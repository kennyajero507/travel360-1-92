
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

const WorkspaceInitializer = ({ children }: { children: React.ReactNode }) => {
  const { 
    session, 
    profile, 
    organization, 
    loading, 
    initializing, 
    error, 
    isWorkspaceReady,
    refreshProfile,
    debugAuth,
    systemHealth
  } = useAuth();
  
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [initTime, setInitTime] = useState(Date.now());

  useEffect(() => {
    setInitTime(Date.now());
  }, [session]);

  const handleDebug = async () => {
    const info = await debugAuth();
    setDebugInfo(info);
    setShowDebug(true);
  };

  const elapsedTime = Math.floor((Date.now() - initTime) / 1000);

  // Show initialization screen
  if (initializing || (session && !isWorkspaceReady && !error)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </div>
            <CardTitle className="text-xl text-slate-800">
              Setting up your workspace...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Authentication</span>
                <Badge variant={session ? "default" : "secondary"} className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Loading Profile</span>
                {profile ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Loading
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Organization Setup</span>
                {organization ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                ) : profile?.org_id ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Loading
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Elapsed: {elapsedTime}s</span>
                <span>{loading ? 'Processing...' : 'Almost ready'}</span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${session ? (profile ? (organization || !profile.org_id ? 100 : 70) : 30) : 10}%` 
                  }}
                ></div>
              </div>
            </div>
            
            {elapsedTime > 10 && (
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Taking longer than expected
                </div>
                <div className="flex gap-2">
                  <Button onClick={refreshProfile} variant="outline" size="sm" className="flex-1">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                  <Button onClick={handleDebug} variant="ghost" size="sm">
                    Debug
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {showDebug && debugInfo && (
          <Card className="mt-6 w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show error state
  if (error && !isWorkspaceReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-800">Workspace Setup Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={refreshProfile} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Setup
              </Button>
              <Button onClick={handleDebug} variant="outline" className="w-full">
                Debug Information
              </Button>
            </div>
            
            <div className="text-xs text-slate-500 text-center">
              If this problem persists, please contact support
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Workspace is ready, render children
  return <>{children}</>;
};

export default WorkspaceInitializer;
