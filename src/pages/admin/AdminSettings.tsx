
import React from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import SystemSettings from '../../components/admin/SystemSettings';
import MobileResponsiveWrapper from '../../components/mobile/MobileResponsiveWrapper';

const AdminSettings = () => {
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
      <div className="space-y-6 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Settings</h1>
        <SystemSettings />
      </div>
    </MobileResponsiveWrapper>
  );
};

export default AdminSettings;
