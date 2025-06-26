
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users } from 'lucide-react';

const Team = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600 mt-2">Manage your team members and their permissions</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <CardTitle>Team Members</CardTitle>
          </div>
          <CardDescription>
            Add and manage team members, assign roles, and control access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This feature is coming soon. You'll be able to invite team members, 
            assign different roles and permissions, and manage your organization's access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;
