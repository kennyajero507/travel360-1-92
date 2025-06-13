
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, CheckCircle, AlertCircle, Users, Database } from 'lucide-react';
import { createFirstAdmin } from '../../utils/createFirstAdmin';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';

const AdminSetup = () => {
  const [setupStep, setSetupStep] = useState<'check' | 'creating' | 'complete'>('check');

  // Check if admin already exists
  const { data: adminExists, isLoading, refetch } = useQuery({
    queryKey: ['admin-check'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'system_admin')
          .limit(1);

        if (error) throw error;
        return data && data.length > 0;
      } catch (error) {
        console.error('Error checking for admin:', error);
        return false;
      }
    },
  });

  const handleCreateAdmin = async () => {
    setSetupStep('creating');
    
    try {
      const result = await createFirstAdmin();
      
      if (result.success) {
        if (result.existed) {
          toast.success("Admin user already exists and role has been updated!");
        } else {
          toast.success("Admin account created successfully!");
        }
        
        toast.info("Admin credentials: admin@travelflow360.com / TravelFlow2024!", {
          duration: 10000
        });
        
        setSetupStep('complete');
        refetch(); // Refresh the admin check
      } else {
        toast.error("Failed to create admin account. Check console for details.");
        setSetupStep('check');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error("An error occurred while creating the admin account");
      setSetupStep('check');
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>Checking admin system status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (adminExists && setupStep !== 'creating') {
    return (
      <Card className="max-w-2xl mx-auto border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Admin System Ready
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              System administrator account is already configured and ready to use.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Admin Access</div>
                <div className="text-sm text-gray-600">
                  Go to <span className="font-mono bg-gray-200 px-1 rounded">/admin/login</span> to access the admin dashboard
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Database className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Database Connected</div>
                <div className="text-sm text-gray-600">
                  Admin system is properly connected to Supabase
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <a 
              href="/admin/login" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Shield className="h-4 w-4 mr-2" />
              Go to Admin Login
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          Admin System Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            No system administrator account found. You need to create the first admin user to manage the platform.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What this will do:</h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                Create admin user: admin@travelflow360.com
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Set password: TravelFlow2024!
              </li>
              <li className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                Configure system_admin role in database
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleCreateAdmin} 
              className="w-full"
              disabled={setupStep === 'creating'}
            >
              {setupStep === 'creating' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Admin Account...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Create System Administrator
                </>
              )}
            </Button>
          </div>

          {setupStep === 'complete' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Admin account created successfully! You can now access the admin dashboard.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Security Note:</strong> This setup process should only be run once during initial deployment. 
          The default credentials should be changed after first login.
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
