
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Building } from 'lucide-react';

const AdminOrganizations = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
        <p className="text-gray-600 mt-2">Manage all organizations in the system</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-green-600" />
            <CardTitle>Organizations</CardTitle>
          </div>
          <CardDescription>
            View and manage all organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Admin organization management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrganizations;
