
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Users, Building, Settings, BarChart3, Shield, AlertTriangle } from "lucide-react";
import SystemStats from "../../components/admin/SystemStats";

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  
  if (!userProfile || userProfile.role !== 'system_admin') {
    return (
      <div className="flex justify-center items-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>You don't have permission to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Administration</h1>
        <p className="text-muted-foreground">
          Welcome, {userProfile.full_name}. Manage the TravelFlow360 platform.
        </p>
      </div>

      {/* System Stats Overview */}
      <SystemStats />
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              User Management
            </CardTitle>
            <CardDescription>Manage users across all organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/settings?tab=users">
              <Button className="w-full">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" />
              Organizations
            </CardTitle>
            <CardDescription>Manage all platform organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/settings?tab=organizations">
              <Button className="w-full">
                Manage Organizations
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              System Settings
            </CardTitle>
            <CardDescription>Configure platform-wide settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/settings?tab=settings">
              <Button className="w-full">
                System Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Analytics
            </CardTitle>
            <CardDescription>View platform analytics and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/settings?tab=analytics">
              <Button className="w-full">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              System Health
            </CardTitle>
            <CardDescription>Monitor system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span>API:</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Storage:</span>
                <span className="text-green-600 font-medium">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security
            </CardTitle>
            <CardDescription>Security monitoring and audit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="text-green-600">No security alerts</div>
              <div className="text-gray-500">Last scan: 2 hours ago</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest platform events and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">New organization registered</div>
                <div className="text-sm text-gray-500">SafariCorp Ltd - 2 hours ago</div>
              </div>
              <div className="text-green-600 text-sm">Active</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">System backup completed</div>
                <div className="text-sm text-gray-500">Automated backup - 6 hours ago</div>
              </div>
              <div className="text-blue-600 text-sm">Success</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Trial expiration reminder sent</div>
                <div className="text-sm text-gray-500">15 organizations notified - 1 day ago</div>
              </div>
              <div className="text-orange-600 text-sm">Notification</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
