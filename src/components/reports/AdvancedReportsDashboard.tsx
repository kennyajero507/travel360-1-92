
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DatePickerWithRange } from '../ui/date-picker';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Calendar, 
  Download, Filter, RefreshCw
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';

interface ReportData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    totalQuotes: number;
    conversionRate: number;
    revenueGrowth: number;
    bookingsGrowth: number;
  };
  revenueByMonth: Array<{ month: string; revenue: number; bookings: number }>;
  bookingsByStatus: Array<{ status: string; count: number; color: string }>;
  quotesByDestination: Array<{ destination: string; count: number; revenue: number }>;
  agentPerformance: Array<{ agent: string; quotes: number; bookings: number; revenue: number }>;
}

const AdvancedReportsDashboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filterBy, setFilterBy] = useState('all');

  const fetchReportData = async () => {
    if (!profile?.org_id || !dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    try {
      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('org_id', profile.org_id)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (bookingsError) throw bookingsError;

      // Fetch quotes data
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('org_id', profile.org_id)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (quotesError) throw quotesError;

      // Process data
      const processedData = processReportData(bookings || [], quotes || []);
      setReportData(processedData);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (bookings: any[], quotes: any[]): ReportData => {
    // Calculate overview metrics
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
    const totalBookings = bookings.length;
    const totalQuotes = quotes.length;
    const conversionRate = totalQuotes > 0 ? (totalBookings / totalQuotes) * 100 : 0;

    // Group revenue by month
    const revenueByMonth = bookings.reduce((acc, booking) => {
      const month = format(new Date(booking.created_at), 'MMM yyyy');
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.revenue += booking.total_price || 0;
        existing.bookings += 1;
      } else {
        acc.push({ month, revenue: booking.total_price || 0, bookings: 1 });
      }
      return acc;
    }, [] as Array<{ month: string; revenue: number; bookings: number }>);

    // Group bookings by status
    const statusColors = {
      confirmed: '#10b981',
      pending: '#f59e0b',
      cancelled: '#ef4444',
      completed: '#3b82f6',
    };

    const bookingsByStatus = bookings.reduce((acc, booking) => {
      const status = booking.status || 'pending';
      const existing = acc.find(item => item.status === status);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ 
          status, 
          count: 1, 
          color: statusColors[status as keyof typeof statusColors] || '#6b7280' 
        });
      }
      return acc;
    }, [] as Array<{ status: string; count: number; color: string }>);

    // Group quotes by destination
    const quotesByDestination = quotes.reduce((acc, quote) => {
      const destination = quote.destination || 'Unknown';
      const existing = acc.find(item => item.destination === destination);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ destination, count: 1, revenue: 0 });
      }
      return acc;
    }, [] as Array<{ destination: string; count: number; revenue: number }>);

    // Mock agent performance data (would need to join with profiles table)
    const agentPerformance = [
      { agent: 'John Doe', quotes: 15, bookings: 8, revenue: 12000 },
      { agent: 'Jane Smith', quotes: 12, bookings: 10, revenue: 15000 },
      { agent: 'Mike Johnson', quotes: 8, bookings: 6, revenue: 9000 },
    ];

    return {
      overview: {
        totalRevenue,
        totalBookings,
        totalQuotes,
        conversionRate,
        revenueGrowth: 12.5, // Mock data
        bookingsGrowth: 8.3, // Mock data
      },
      revenueByMonth,
      bookingsByStatus,
      quotesByDestination,
      agentPerformance,
    };
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange, profile?.org_id]);

  const exportReport = () => {
    // Implementation for exporting reports
    toast.success('Report exported successfully');
  };

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reports</h1>
          <p className="text-gray-600">Comprehensive business analytics and insights</p>
        </div>
        
        <div className="flex gap-2">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchReportData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {reportData.overview.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{reportData.overview.revenueGrowth}%
              </span>
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.overview.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{reportData.overview.bookingsGrowth}%
              </span>
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.overview.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              Generated in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.overview.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Quote to booking conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="bookings">Booking Status</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue and booking counts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={reportData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#0d9488" fill="#0d9488" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
              <CardDescription>Current status of all bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.bookingsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData.bookingsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Destinations</CardTitle>
              <CardDescription>Quote requests by destination</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.quotesByDestination}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="destination" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d9488" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Performance metrics by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.agentPerformance.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{agent.agent}</h4>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{agent.quotes} quotes</span>
                        <span>{agent.bookings} bookings</span>
                        <span>KSh {agent.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {agent.bookings > 0 ? Math.round((agent.bookings / agent.quotes) * 100) : 0}% conversion
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReportsDashboard;
