
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Users, 
  Building, 
  Activity, 
  FileText
} from "lucide-react";
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
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage all system users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Users</span>
                  <span className="font-bold">247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Today</span>
                  <span className="font-bold text-green-600">148</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Invites</span>
                  <span className="font-bold text-orange-600">12</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Management
              </CardTitle>
              <CardDescription>Monitor and manage all organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Orgs</span>
                  <span className="font-bold">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Subscriptions</span>
                  <span className="font-bold text-green-600">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trial Accounts</span>
                  <span className="font-bold text-blue-600">8</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Manage Organizations
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Maintenance
              </CardTitle>
              <CardDescription>Database and system operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Backup</span>
                  <span className="font-bold text-green-600">2h ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Size</span>
                  <span className="font-bold">2.4 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uptime</span>
                  <span className="font-bold text-green-600">99.9%</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  System Tools
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>Latest events and system changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New organization registered</p>
                  <p className="text-xs text-gray-500">Acme Travel Co. - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System backup completed</p>
                  <p className="text-xs text-gray-500">Automated backup - 4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">High quote volume detected</p>
                  <p className="text-xs text-gray-500">150+ quotes created today - 6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileResponsiveWrapper>
  );
};

export default AdminDashboard;
