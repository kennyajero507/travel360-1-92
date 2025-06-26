
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const AuthDebugger = () => {
  const { session, user, profile, loading, error } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  const testConnection = async () => {
    try {
      setTestResult('Testing database connection...');
      
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        setTestResult(`Database error: ${error.message}`);
        return;
      }
      
      setTestResult('Database connection successful');
    } catch (err: any) {
      setTestResult(`Connection failed: ${err.message}`);
    }
  };

  const testProfileCreation = async () => {
    if (!user) {
      setTestResult('No user to test with');
      return;
    }

    try {
      setTestResult('Testing profile creation...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        setTestResult(`Profile query error: ${error.message}`);
        return;
      }
      
      if (!data) {
        setTestResult('Profile does not exist - this might be the issue');
      } else {
        setTestResult('Profile exists and is accessible');
      }
    } catch (err: any) {
      setTestResult(`Profile test failed: ${err.message}`);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Loading:</strong> <Badge variant={loading ? "destructive" : "default"}>{loading ? 'Yes' : 'No'}</Badge>
          </div>
          <div>
            <strong>Session:</strong> <Badge variant={session ? "default" : "destructive"}>{session ? 'Active' : 'None'}</Badge>
          </div>
          <div>
            <strong>User:</strong> <Badge variant={user ? "default" : "destructive"}>{user ? 'Loaded' : 'None'}</Badge>
          </div>
          <div>
            <strong>Profile:</strong> <Badge variant={profile ? "default" : "destructive"}>{profile ? 'Loaded' : 'None'}</Badge>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {user && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <strong>User ID:</strong> {user.id}<br/>
            <strong>Email:</strong> {user.email}
          </div>
        )}
        
        {profile && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <strong>Profile Role:</strong> {profile.role}<br/>
            <strong>Full Name:</strong> {profile.full_name}<br/>
            <strong>Org ID:</strong> {profile.org_id || 'None'}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button onClick={testConnection} variant="outline">
            Test DB Connection
          </Button>
          <Button onClick={testProfileCreation} variant="outline" disabled={!user}>
            Test Profile Access
          </Button>
        </div>
        
        {testResult && (
          <div className="p-3 bg-gray-50 border rounded">
            <strong>Test Result:</strong> {testResult}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;
