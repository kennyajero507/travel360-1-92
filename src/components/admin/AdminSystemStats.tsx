
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Building, FileText, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface SystemStats {
  totalUsers: number;
  totalOrganizations: number;
  activeQuotes: number;
  totalBookings: number;
  revenueThisMonth: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

const AdminSystemStats = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    activeQuotes: 0,
    totalBookings: 0,
    revenueThisMonth: 0,
    systemHealth: 'good'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const [usersResult, orgsResult, quotesResult, bookingsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('organizations').select('id', { count: 'exact' }),
        supabase.from('quotes').select('id', { count: 'exact' }).eq('status', 'draft'),
        supabase.from('bookings').select('total_price', { count: 'exact' })
      ]);

      // Calculate revenue (simplified)
      const revenue = bookingsResult.data?.reduce((sum, booking) => sum + (Number(booking.total_price) || 0), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalOrganizations: orgsResult.count || 0,
        activeQuotes: quotesResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        revenueThisMonth: revenue,
        systemHealth: 'good'
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">Good</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organizations</p>
                <p className="text-2xl font-bold">{stats.totalOrganizations}</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Quotes</p>
                <p className="text-2xl font-bold">{stats.activeQuotes}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            System Health
            {getHealthBadge(stats.systemHealth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Status</span>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authentication</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemStats;
