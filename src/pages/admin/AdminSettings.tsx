
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import SystemStats from "../../components/admin/SystemStats";
import UserManagement from "../../components/admin/UserManagement";
import OrganizationManagement from "../../components/admin/OrganizationManagement";
import AdminSettings from "../../components/AdminSettings";

const AdminSettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Administration</h1>
        <p className="text-muted-foreground">
          Manage users, organizations, and system-wide settings.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
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
                <p className="text-muted-foreground">System activity feed coming soon...</p>
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
              <p className="text-muted-foreground">
                Advanced analytics and reporting dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettingsPage;
