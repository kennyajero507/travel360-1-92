
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Shield, Key, Globe } from 'lucide-react';
import { createFirstAdmin } from '../../utils/createFirstAdmin';
import { toast } from 'sonner';

const AdminAccessInfo = () => {
  const handleCreateAdmin = async () => {
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
    } else {
      toast.error("Failed to create admin account. Check console for details.");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          Admin System Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Admin Access Instructions</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>1. Click "Create Admin Account" below to set up the first admin user</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>2. Navigate to /admin/login to access the admin login page</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>3. Use credentials: admin@travelflow360.com / TravelFlow2024!</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={handleCreateAdmin} className="w-full">
            Create Admin Account
          </Button>
          <div className="text-center">
            <a 
              href="/admin/login" 
              className="text-blue-600 hover:underline text-sm"
            >
              Go to Admin Login →
            </a>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Note:</strong> This component is for initial setup only. 
          Remove it from production or restrict access to development environment.
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAccessInfo;
