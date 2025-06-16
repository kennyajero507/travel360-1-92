
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: Date;
}

const SystemHealthCheck = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runHealthChecks = async () => {
    setIsRunning(true);
    const checks: HealthCheck[] = [];

    // Database connectivity
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      checks.push({
        name: 'Database Connection',
        status: error ? 'error' : 'healthy',
        message: error ? error.message : 'Database is accessible',
        lastChecked: new Date()
      });
    } catch (error) {
      checks.push({
        name: 'Database Connection',
        status: 'error',
        message: 'Failed to connect to database',
        lastChecked: new Date()
      });
    }

    // Email service check
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { test: true, to: 'test@example.com', subject: 'Test', html: 'Test' }
      });
      
      checks.push({
        name: 'Email Service',
        status: error?.message?.includes('RESEND_API_KEY') ? 'warning' : 'healthy',
        message: error?.message?.includes('RESEND_API_KEY') 
          ? 'RESEND_API_KEY not configured' 
          : 'Email service is operational',
        lastChecked: new Date()
      });
    } catch (error) {
      checks.push({
        name: 'Email Service',
        status: 'error',
        message: 'Email function not responding',
        lastChecked: new Date()
      });
    }

    // Authentication check
    try {
      const { data: { user } } = await supabase.auth.getUser();
      checks.push({
        name: 'Authentication',
        status: 'healthy',
        message: user ? 'User authenticated' : 'Authentication service active',
        lastChecked: new Date()
      });
    } catch (error) {
      checks.push({
        name: 'Authentication',
        status: 'error',
        message: 'Authentication service error',
        lastChecked: new Date()
      });
    }

    setHealthChecks(checks);
    setIsRunning(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Health Check</CardTitle>
          <Button 
            onClick={runHealthChecks} 
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-gray-600">{check.message}</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(check.status)}
                <p className="text-xs text-gray-500 mt-1">
                  {check.lastChecked.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthCheck;
