
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useRole } from '../contexts/RoleContext';
import AdvancedAnalyticsDashboard from '../components/analytics/AdvancedAnalyticsDashboard';
import ReportsExportManager from '../components/analytics/ReportsExportManager';
import MobileResponsiveWrapper from '../components/mobile/MobileResponsiveWrapper';

const AdvancedAnalytics = () => {
  const { permissions } = useRole();

  if (!permissions.canViewReports) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have permission to view advanced analytics.</p>
      </div>
    );
  }

  return (
    <MobileResponsiveWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics & Reporting</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive business intelligence with detailed reporting and export capabilities
          </p>
        </div>
        
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Export Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdvancedAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsExportManager />
          </TabsContent>
        </Tabs>
      </div>
    </MobileResponsiveWrapper>
  );
};

export default AdvancedAnalytics;
