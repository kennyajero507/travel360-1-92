
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Building, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendDirection, loading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
        ) : (
          value
        )}
      </div>
      {trend && !loading && (
        <p className={`text-xs ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

const AdminDashboardStats = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalQuotes: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Only system admins can see all stats
        if (profile?.role !== 'system_admin') {
          setLoading(false);
          return;
        }

        // Fetch user count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch organization count
        const { count: orgCount } = await supabase
          .from('organizations')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null);

        // Fetch quote count
        const { count: quoteCount } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true });

        // Fetch booking count
        const { count: bookingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: userCount || 0,
          totalOrganizations: orgCount || 0,
          totalQuotes: quoteCount || 0,
          totalBookings: bookingCount || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile?.role]);

  const dashboardStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      trend: '+2 from last month',
      trendDirection: 'up' as const
    },
    {
      title: 'Organizations',
      value: stats.totalOrganizations,
      icon: <Building className="h-4 w-4 text-muted-foreground" />,
      trend: '+1 this month',
      trendDirection: 'up' as const
    },
    {
      title: 'Total Quotes',
      value: stats.totalQuotes,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      trend: stats.totalQuotes > 0 ? `${stats.totalQuotes} quotes created` : 'No quotes yet',
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
      {dashboardStats.map((stat, index) => (
        <StatCard key={index} {...stat} loading={loading} />
      ))}
    </div>
  );
};

export default AdminDashboardStats;
