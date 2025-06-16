
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import SystemSettings from '../../components/admin/SystemSettings';
import SystemDiagnostics from '../../components/admin/SystemDiagnostics';
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
        <h1 className="text-3xl font-bold">System Administration</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemDiagnostics />
          <div>
            <SystemSettings />
          </div>
        </div>
      </div>
    </MobileResponsiveWrapper>
  );
};

export default AdminSettings;
