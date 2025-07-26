import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, CreditCard, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';

const AdminDashboard = () => {
  const { metrics, loading, error } = useSystemMetrics();

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Organizations",
      value: metrics?.totalOrganizations || 0,
      change: metrics?.orgGrowth || 0,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Users",
      value: metrics?.totalUsers || 0,
      change: metrics?.userGrowth || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Active Subscriptions",
      value: metrics?.activeSubscriptions || 0,
      change: metrics?.subscriptionGrowth || 0,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Monthly Revenue",
      value: `$${metrics?.monthlyRevenue || 0}`,
      change: metrics?.revenueGrowth || 0,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administrator Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the entire TravelFlow360 platform</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Activity className="h-3 w-3 mr-1" />
          System Healthy
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`${metric.bgColor} p-2 rounded-full`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change > 0 ? '+' : ''}{metric.change}% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Organizations</CardTitle>
            <CardDescription>Newly registered organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.recentOrganizations?.map((org: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-sm text-muted-foreground">{org.owner_email}</p>
                  </div>
                  <Badge variant={org.subscription_status === 'trial' ? 'secondary' : 'default'}>
                    {org.subscription_status}
                  </Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No recent organizations</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.systemAlerts?.map((alert: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No system alerts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;