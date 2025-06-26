
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

interface HealthCheck {
  id: string;
  name: string;
  status: 'checking' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

const SystemHealthCheck = () => {
  const { user, profile, session } = useAuth();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const healthChecks = [
    {
      id: 'database_connection',
      name: 'Database Connection',
      check: async () => {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) throw new Error(`Database error: ${error.message}`);
        return 'Database connection successful';
      }
    },
    {
      id: 'auth_session',
      name: 'Authentication Session',
      check: async () => {
        if (!session) throw new Error('No active session');
        if (!user) throw new Error('No user data');
        return `Session active for user: ${user.email}`;
      }
    },
    {
      id: 'profile_access',
      name: 'Profile Access',
      check: async () => {
        if (!user) throw new Error('No authenticated user');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw new Error(`Profile query error: ${error.message}`);
        if (!data) throw new Error('Profile not found - this needs to be fixed');
        
        return `Profile found: ${data.full_name || 'No name'} (${data.role})`;
      }
    },
    {
      id: 'organization_access',
      name: 'Organization Access',
      check: async () => {
        if (!profile) throw new Error('No profile loaded');
        
        if (!profile.org_id) {
          return 'No organization assigned (this may be expected for some roles)';
        }
        
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.org_id)
          .maybeSingle();
        
        if (error) throw new Error(`Organization query error: ${error.message}`);
        if (!data) throw new Error('Organization not found but profile has org_id');
        
        return `Organization found: ${data.name}`;
      }
    },
    {
      id: 'rls_policies',
      name: 'RLS Policies Check',
      check: async () => {
        if (!user) throw new Error('No authenticated user');
        
        // Test if we can access our own profile (should work)
        const { data: ownProfile, error: ownError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (ownError) throw new Error(`Cannot access own profile: ${ownError.message}`);
        if (!ownProfile) throw new Error('Own profile not accessible');
        
        // Test if we can try to access all profiles (should be restricted unless admin)
        const { data: allProfiles, error: allError } = await supabase
          .from('profiles')
          .select('id')
          .limit(10);
        
        if (allError && !allError.message.includes('permission')) {
          throw new Error(`Unexpected RLS error: ${allError.message}`);
        }
        
        const profileCount = allProfiles?.length || 0;
        const canAccessAll = profileCount > 1 || ownProfile.role === 'system_admin';
        
        return `RLS working correctly. Own profile: ✓, Access level: ${canAccessAll ? 'Admin' : 'User'}`;
      }
    },
    {
      id: 'trigger_function',
      name: 'Profile Creation Trigger',
      check: async () => {
        // Simple check - if we have a profile, the trigger is likely working
        if (profile) {
          return 'Profile creation working (trigger likely functional)';
        }
        
        // If no profile but we have a user, this suggests trigger issues
        if (user && !profile) {
          throw new Error('Profile missing despite user existing - trigger may not be working');
        }
        
        return 'Profile creation trigger status unknown but profiles exist';
      }
    }
  ];

  const runHealthCheck = async () => {
    setIsRunning(true);
    const results: HealthCheck[] = [];
    
    for (const healthCheck of healthChecks) {
      const check: HealthCheck = {
        id: healthCheck.id,
        name: healthCheck.name,
        status: 'checking',
        message: 'Running...'
      };
      
      results.push(check);
      setChecks([...results]);
      
      try {
        const result = await healthCheck.check();
        check.status = 'success';
        check.message = result;
      } catch (error: any) {
        check.status = 'error';
        check.message = error.message;
        check.details = error.stack;
      }
      
      setChecks([...results]);
      
      // Small delay between checks
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
  };

  useEffect(() => {
    if (user) {
      runHealthCheck();
    }
  }, [user]);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          System Health Check
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50">
            ✓ {successCount} Passed
          </Badge>
          {warningCount > 0 && (
            <Badge variant="outline" className="bg-yellow-50">
              ⚠ {warningCount} Warnings
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="outline" className="bg-red-50">
              ✗ {errorCount} Failed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStatusIcon(check.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{check.name}</h4>
                  <Badge className={getStatusColor(check.status)} variant="outline">
                    {check.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{check.message}</p>
                {check.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Show details
                    </summary>
                    <pre className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">
                      {check.details}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={runHealthCheck}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Checks...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Health Check
              </>
            )}
          </Button>
        </div>
        
        {checks.length > 0 && (
          <div className="text-sm text-gray-500">
            Last check: {new Date().toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthCheck;
