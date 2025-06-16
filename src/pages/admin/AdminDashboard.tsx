
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import AdminSystemStats from '../../components/admin/AdminSystemStats';
import SystemHealthCheck from '../../components/admin/SystemHealthCheck';
import WorkflowTester from '../../components/admin/WorkflowTester';
import MobileResponsiveWrapper from '../../components/mobile/MobileResponsiveWrapper';

const AdminDashboard = () => {
  const { profile } = useAuth();
  
  if (!profile || profile.role !== 'system_admin') {
    return (
      <MobileResponsiveWrapper>
        <div className="flex justify-center items-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Access Denied</CardTitle>
              <CardDescription>You don't have permission to view this page.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MobileResponsiveWrapper>
    );
  }
  
  return (
    <MobileResponsiveWrapper>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {/* Platform Analytics Panel */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Platform Statistics</h2>
          <AdminSystemStats />
        </div>

        {/* System Health & Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemHealthCheck />
          <WorkflowTester />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all system users</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User management tools available in Settings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
              <CardDescription>Manage all organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Organization management tools available in Settings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
              <CardDescription>Database and system operations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Maintenance tools coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileResponsiveWrapper>
  );
};

export default AdminDashboard;
