
import React from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import SystemMonitoring from '../../components/admin/SystemMonitoring';

const AdminSystemMonitoring = () => {
  const { profile } = useAuth();
  
  if (!profile || profile.role !== 'system_admin') {
    return (
      <div className="flex justify-center items-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Monitoring</h1>
      <SystemMonitoring />
    </div>
  );
};

export default AdminSystemMonitoring;
