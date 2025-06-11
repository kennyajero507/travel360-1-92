
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { enhancedBookingService } from "../../services/enhancedBookingService";
import { BookingAnalytics } from "../../types/enhanced-booking.types";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users,
  BarChart3,
  PieChart
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const BookingAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<BookingAnalytics[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [analyticsData, metricsData] = await Promise.all([
        enhancedBookingService.getBookingAnalytics(),
        enhancedBookingService.getRevenueMetrics()
      ]);
      
      setAnalytics(analyticsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.averageProfitMargin || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalBookings > 0 ? metrics.totalRevenue / metrics.totalBookings : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monthly Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Booking Source Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Booking Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Direct Website', 'Travel Agents', 'Phone Inquiries', 'Email Campaigns'].map((source, index) => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-sm">{source}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${[45, 30, 15, 10][index]}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{[45, 30, 15, 10][index]}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Conversion Rate</span>
                <span className="font-medium">18.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Days to Book</span>
                <span className="font-medium">7.2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Client Satisfaction</span>
                <span className="font-medium">4.7/5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Repeat Customers</span>
                <span className="font-medium">23%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingAnalyticsDashboard;
