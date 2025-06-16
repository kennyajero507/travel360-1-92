
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Play, Database, Mail, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import EmailService from '../../services/emailService';
import StorageService from '../../services/storageService';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

const SystemDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    const diagnosticResults: DiagnosticResult[] = [];

    // Database connectivity test
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      diagnosticResults.push({
        name: 'Database Connection',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Database is accessible and responding',
        details: error ? `Error code: ${error.code}` : 'Connection established successfully'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Database Connection',
        status: 'error',
        message: 'Failed to connect to database',
        details: error instanceof Error ? error.message : 'Unknown database error'
      });
    }

    // Email service test
    try {
      const emailCheck = await EmailService.checkEmailConfiguration();
      diagnosticResults.push({
        name: 'Email Service',
        status: emailCheck.configured ? 'success' : 'warning',
        message: emailCheck.configured ? 'Email service is operational' : 'Email service needs configuration',
        details: emailCheck.message || 'Email service check completed'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Email Service',
        status: 'error',
        message: 'Email service test failed',
        details: error instanceof Error ? error.message : 'Unknown email error'
      });
    }

    // Storage service test
    try {
      const storageTest = await StorageService.listFiles('test-bucket');
      diagnosticResults.push({
        name: 'Storage Service',
        status: storageTest.success ? 'success' : 'warning',
        message: storageTest.success ? 'Storage service is operational' : 'Storage buckets may not be configured',
        details: storageTest.error || 'Storage service accessible'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Storage Service',
        status: 'warning',
        message: 'Storage service test inconclusive',
        details: 'Storage buckets may need to be created'
      });
    }

    // Authentication test
    try {
      const { data: { user } } = await supabase.auth.getUser();
      diagnosticResults.push({
        name: 'Authentication Service',
        status: 'success',
        message: user ? 'User authenticated successfully' : 'Authentication service active',
        details: user ? `User ID: ${user.id}` : 'Authentication endpoint responding'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Authentication Service',
        status: 'error',
        message: 'Authentication service error',
        details: error instanceof Error ? error.message : 'Auth service unavailable'
      });
    }

    // Organizations check
    try {
      const { data, error } = await supabase.from('organizations').select('id').limit(1);
      diagnosticResults.push({
        name: 'Organizations Setup',
        status: error ? 'error' : data && data.length > 0 ? 'success' : 'warning',
        message: error ? 'Organizations table error' : data && data.length > 0 ? 'Organizations configured' : 'No organizations found',
        details: error ? error.message : data && data.length > 0 ? `${data.length} organization(s) found` : 'System needs at least one organization'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Organizations Setup',
        status: 'error',
        message: 'Failed to check organizations',
        details: error instanceof Error ? error.message : 'Unknown organizations error'
      });
    }

    // Hotels check
    try {
      const { data, error } = await supabase.from('hotels').select('id').limit(1);
      diagnosticResults.push({
        name: 'Hotels Database',
        status: error ? 'error' : data && data.length > 0 ? 'success' : 'warning',
        message: error ? 'Hotels table error' : data && data.length > 0 ? 'Hotels database populated' : 'No hotels found',
        details: error ? error.message : data && data.length > 0 ? `Hotel data available` : 'Add hotels to enable quote generation'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Hotels Database',
        status: 'error',
        message: 'Failed to check hotels',
        details: error instanceof Error ? error.message : 'Unknown hotels error'
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);
    
    const successCount = diagnosticResults.filter(r => r.status === 'success').length;
    const totalCount = diagnosticResults.length;
    
    if (successCount === totalCount) {
      toast.success('All diagnostics passed!');
    } else {
      toast.warning(`${successCount}/${totalCount} diagnostics passed. Check results below.`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Diagnostics
          </CardTitle>
          <Button 
            onClick={runFullDiagnostics} 
            disabled={isRunning}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 && !isRunning && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Click "Run Diagnostics" to test all system components and identify any issues.
            </AlertDescription>
          </Alert>
        )}

        {isRunning && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running comprehensive system diagnostics...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <h4 className="font-medium">{result.name}</h4>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                {result.details && (
                  <p className="text-xs text-gray-500">{result.details}</p>
                )}
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {results.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-gray-600">Failed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemDiagnostics;
