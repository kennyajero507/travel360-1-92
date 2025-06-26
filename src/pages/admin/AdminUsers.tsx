
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Users } from 'lucide-react';

const AdminUsers = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage system users and their permissions</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle>System Users</CardTitle>
          </div>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Admin user management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
