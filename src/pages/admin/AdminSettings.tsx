
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import SystemStats from "../../components/admin/SystemStats";
import UserManagement from "../../components/admin/UserManagement";
import OrganizationManagement from "../../components/admin/OrganizationManagement";
import AdminSettings from "../../components/AdminSettings";

const AdminSettingsPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Administration</h1>
        <p className="text-muted-foreground">
          Manage users, organizations, and system-wide settings.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SystemStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">New user registration</div>
                      <div className="text-sm text-gray-500">john.doe@example.com</div>
                    </div>
                    <div className="text-xs text-gray-400">2h ago</div>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">Organization upgrade</div>
                      <div className="text-sm text-gray-500">SafariCorp to Pro plan</div>
                    </div>
                    <div className="text-xs text-gray-400">5h ago</div>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">System maintenance</div>
                      <div className="text-sm text-gray-500">Database optimization</div>
                    </div>
                    <div className="text-xs text-gray-400">1d ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Database</span>
                    <span className="text-green-600">Healthy</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Response</span>
                    <span className="text-green-600">Fast</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage</span>
                    <span className="text-green-600">Available</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage</span>
                    <span className="text-yellow-600">75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU Usage</span>
                    <span className="text-green-600">34%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationManagement />
        </TabsContent>

        <TabsContent value="settings">
          <AdminSettings />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2,847</div>
                  <div className="text-sm text-blue-600">Total API Calls Today</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-green-600">System Uptime</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">156ms</div>
                  <div className="text-sm text-purple-600">Avg Response Time</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">42</div>
                  <div className="text-sm text-orange-600">Active Sessions</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Usage Trends</h3>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="text-gray-500">
                    📊 Advanced analytics dashboard will be implemented here
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Charts, graphs, and detailed metrics coming soon
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettingsPage;
