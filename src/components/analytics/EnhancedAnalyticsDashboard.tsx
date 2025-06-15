
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useBookingAnalytics } from '../../hooks/useBookingAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar, Target, Activity } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const EnhancedAnalyticsDashboard = () => {
  const { 
    quoteCount, 
    bookingCount, 
    invoiceCount, 
    bookingRevenue, 
    invoiceRevenue, 
    isLoading: analyticsLoading 
  } = useAnalytics();
  
  const { 
    data: dashboardStats, 
    isLoading: statsLoading 
  } = useDashboardStats();
  
  const { 
    analytics: bookingAnalytics, 
    isLoading: bookingLoading 
  } = useBookingAnalytics();

  // Mock trend data - replace with real API calls
  const trendData = [
    { month: 'Jan', bookings: 12, revenue: 24000, quotes: 45 },
    { month: 'Feb', bookings: 19, revenue: 38000, quotes: 52 },
    { month: 'Mar', bookings: 15, revenue: 30000, quotes: 38 },
    { month: 'Apr', bookings: 22, revenue: 44000, quotes: 61 },
    { month: 'May', bookings: 18, revenue: 36000, quotes: 47 },
    { month: 'Jun', bookings: 25, revenue: 50000, quotes: 68 },
  ];

  const statusDistribution = [
    { name: 'Confirmed', value: bookingAnalytics.confirmedBookings, color: '#10B981' },
    { name: 'Pending', value: bookingAnalytics.pendingBookings, color: '#F59E0B' },
    { name: 'Completed', value: bookingAnalytics.completedBookings, color: '#3B82F6' },
    { name: 'Cancelled', value: bookingAnalytics.cancelledBookings, color: '#EF4444' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (analyticsLoading || statsLoading || bookingLoading) {
    return <AnalyticsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Quotes"
          value={quoteCount.toString()}
          icon={<Target className="h-4 w-4" />}
          trend="+12%"
          color="blue"
        />
        <MetricCard
          title="Active Bookings"
          value={bookingCount.toString()}
          icon={<Calendar className="h-4 w-4" />}
          trend="+8%"
          color="green"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(bookingRevenue + invoiceRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
          trend="+15%"
          color="purple"
        />
        <MetricCard
          title="Active Inquiries"
          value={(dashboardStats?.activeInquiries || 0).toString()}
          icon={<Activity className="h-4 w-4" />}
          trend="+5%"
          color="orange"
        />
        <MetricCard
          title="Conversion Rate"
          value="68%"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="+3%"
          color="teal"
        />
        <MetricCard
          title="Avg. Booking Value"
          value={formatCurrency(bookingAnalytics.averageBookingValue)}
          icon={<Users className="h-4 w-4" />}
          trend="+7%"
          color="pink"
        />
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Bookings, quotes, and revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Status Distribution</CardTitle>
                <CardDescription>Current booking status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Monthly revenue trends and growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Performance</CardTitle>
              <CardDescription>Monthly booking counts and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quote to Booking Conversion</CardTitle>
                <CardDescription>Conversion funnel analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quotes Created</span>
                    <span className="text-2xl font-bold">{quoteCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bookings Created</span>
                    <span className="text-2xl font-bold">{bookingCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(bookingCount / Math.max(quoteCount, 1)) * 100}%` }}></div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-center">
                      <span className="text-lg font-semibold text-green-600">
                        {((bookingCount / Math.max(quoteCount, 1)) * 100).toFixed(1)}%
                      </span>
                      <p className="text-sm text-gray-500">Conversion Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Month-over-month growth indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">Revenue Growth</p>
                      <p className="text-xs text-green-600">vs. last month</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">+15%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Booking Growth</p>
                      <p className="text-xs text-blue-600">vs. last month</p>
                    </div>
                    <span className="text-lg font-bold text-blue-600">+8%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Client Growth</p>
                      <p className="text-xs text-purple-600">vs. last month</p>
                    </div>
                    <span className="text-lg font-bold text-purple-600">+12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'pink';
}

const MetricCard = ({ title, value, icon, trend, color }: MetricCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    teal: 'from-teal-500 to-teal-600',
    pink: 'from-pink-500 to-pink-600'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
            {icon}
          </div>
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">{value}</h3>
          <p className="text-xs font-medium text-gray-600">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-80 w-full" />
    </div>
  </div>
);

export default EnhancedAnalyticsDashboard;
