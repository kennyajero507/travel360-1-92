
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/date-picker';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, DollarSign, Users, Calendar, Target, Activity,
  Download, Filter, RefreshCw
} from 'lucide-react';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';

const AdvancedAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [reportType, setReportType] = useState('overview');
  const { analyticsData, isLoading, error, refetch } = useAnalyticsData();

  const handleExportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    toast.info(`Exporting ${reportType} report as ${format.toUpperCase()}...`);
    // TODO: Implement export functionality
    setTimeout(() => {
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Failed to load analytics data</div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const { revenue, bookings, quotes, inquiries, topDestinations, monthlyTrends } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header with Filters and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-gray-500">Comprehensive business intelligence and reporting</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="bookings">Bookings</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="quotes">Quotes</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium">Date Range:</span>
            <DatePicker
              date={dateRange.start}
              onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
              placeholder="Start Date"
            />
            <span className="text-gray-400">to</span>
            <DatePicker
              date={dateRange.end}
              onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
              placeholder="End Date"
            />
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(revenue.total)}
          icon={<DollarSign className="h-4 w-4" />}
          trend={`+${revenue.growth.toFixed(1)}%`}
          color="green"
        />
        <MetricCard
          title="Total Bookings"
          value={bookings.total.toString()}
          icon={<Calendar className="h-4 w-4" />}
          trend="+8%"
          color="blue"
        />
        <MetricCard
          title="Quote Conversion"
          value={`${quotes.conversionRate.toFixed(1)}%`}
          icon={<Target className="h-4 w-4" />}
          trend="+5%"
          color="purple"
        />
        <MetricCard
          title="Active Inquiries"
          value={inquiries.new.toString()}
          icon={<Activity className="h-4 w-4" />}
          trend="+12%"
          color="orange"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Trends Over Time</CardTitle>
              <CardDescription>Monthly performance across all key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stackId="2"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Monthly revenue trends and projections</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
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

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Current month vs previous month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-lg font-semibold text-green-800">This Month</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(revenue.thisMonth)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">Last Month</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {formatCurrency(revenue.lastMonth)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border-t">
                    <span className={`text-lg font-semibold ${revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {revenue.growth >= 0 ? '+' : ''}{revenue.growth.toFixed(1)}% Growth
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Status Distribution</CardTitle>
                <CardDescription>Current booking pipeline status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Confirmed', value: bookings.confirmed, color: '#10B981' },
                        { name: 'Pending', value: bookings.pending, color: '#F59E0B' },
                        { name: 'Cancelled', value: bookings.cancelled, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Confirmed', value: bookings.confirmed, color: '#10B981' },
                        { name: 'Pending', value: bookings.pending, color: '#F59E0B' },
                        { name: 'Cancelled', value: bookings.cancelled, color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>From inquiry to booking conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Inquiries</span>
                    <span className="text-2xl font-bold">{inquiries.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quotes Generated</span>
                    <span className="text-2xl font-bold">{quotes.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${(quotes.total / Math.max(inquiries.total, 1)) * 100}%` }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bookings Created</span>
                    <span className="text-2xl font-bold">{bookings.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-600 h-3 rounded-full" style={{ width: `${(bookings.total / Math.max(quotes.total, 1)) * 100}%` }}></div>
                  </div>
                  
                  <div className="pt-4 border-t text-center">
                    <span className="text-lg font-semibold text-green-600">
                      {((bookings.total / Math.max(inquiries.total, 1)) * 100).toFixed(1)}%
                    </span>
                    <p className="text-sm text-gray-500">Overall Conversion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Destinations</CardTitle>
              <CardDescription>Most popular destinations by bookings and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {topDestinations.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topDestinations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="destination" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : value,
                      name === 'revenue' ? 'Revenue' : 'Bookings'
                    ]} />
                    <Bar dataKey="bookings" fill="#3B82F6" />
                    <Bar dataKey="revenue" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No destination data available yet
                </div>
              )}
            </CardContent>
          </Card>
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
  color: 'green' | 'blue' | 'purple' | 'orange';
}

const MetricCard = ({ title, value, icon, trend, color }: MetricCardProps) => {
  const colorClasses = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
            {icon}
          </div>
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
);

export default AdvancedAnalyticsDashboard;
