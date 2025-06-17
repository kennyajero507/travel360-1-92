
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import AdminDashboardStats from '../../components/admin/AdminDashboardStats';
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
            </CardHeader>
            <CardContent>
              <p>You don't have permission to view this page.</p>
            </CardContent>
          </Card>
        </div>
      </MobileResponsiveWrapper>
    );
  }
  
  return (
    <MobileResponsiveWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-muted-foreground">
            Monitor and manage the TravelFlow360 system
          </p>
        </div>
        
        <AdminDashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                System activity logs will appear here
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Database</span>
                  <span className="text-green-600">Operational</span>
                </div>
                <div className="flex justify-between">
                  <span>Authentication</span>
                  <span className="text-green-600">Operational</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage</span>
                  <span className="text-green-600">Operational</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileResponsiveWrapper>
  );
};

export default AdminDashboard;
