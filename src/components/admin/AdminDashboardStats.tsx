
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Building, FileText, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendDirection }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className={`text-xs ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

const AdminDashboardStats = () => {
  // Mock data - in real implementation, this would come from API
  const stats = [
    {
      title: 'Total Users',
      value: 1,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      trend: '+2 from last month',
      trendDirection: 'up' as const
    },
    {
      title: 'Organizations',
      value: 1,
      icon: <Building className="h-4 w-4 text-muted-foreground" />,
      trend: '+1 this month',
      trendDirection: 'up' as const
    },
    {
      title: 'Total Quotes',
      value: 0,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      trend: 'No quotes yet',
      trendDirection: 'up' as const
    },
    {
      title: 'System Health',
      value: '99.9%',
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      trend: 'All systems operational',
      trendDirection: 'up' as const
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default AdminDashboardStats;
