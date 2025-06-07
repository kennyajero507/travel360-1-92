
import React from 'react';
import { useRole } from '../contexts/RoleContext';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

const Analytics = () => {
  const { permissions } = useRole();

  if (!permissions.canViewReports) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have permission to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Track your business performance and key metrics
        </p>
      </div>
      
      <AnalyticsDashboard />
    </div>
  );
};

export default Analytics;
