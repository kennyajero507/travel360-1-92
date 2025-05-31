
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DatePickerWithRange } from "../components/ui/date-picker";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign,
  MessageSquare,
  Calendar,
  Target,
  Download
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { getAllInquiries } from "../services/inquiryService";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { toast } from "sonner";

const Reports = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 2)),
    to: endOfMonth(new Date())
  });
  const [selectedPeriod, setSelectedPeriod] = useState("3months");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getAllInquiries();
        setInquiries(data);
      } catch (error) {
        console.error("Error loading reports data:", error);
        toast.error("Failed to load reports data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter inquiries by date range
  const filteredInquiries = inquiries.filter(inquiry => {
    const inquiryDate = parseISO(inquiry.created_at);
    return inquiryDate >= dateRange.from && inquiryDate <= dateRange.to;
  });

  // Calculate metrics
  const totalInquiries = filteredInquiries.length;
  const assignedInquiries = filteredInquiries.filter(inq => inq.status === 'Assigned').length;
  const quotedInquiries = filteredInquiries.filter(inq => inq.status === 'Quoted').length;
  const closedInquiries = filteredInquiries.filter(inq => inq.status === 'Closed').length;
  const conversionRate = totalInquiries > 0 ? ((quotedInquiries + closedInquiries) / totalInquiries * 100).toFixed(1) : '0';

  // Monthly trend data
  const monthlyData = [];
  for (let i = 2; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(subMonths(new Date(), i));
    const monthInquiries = inquiries.filter(inq => {
      const inquiryDate = parseISO(inq.created_at);
      return inquiryDate >= monthStart && inquiryDate <= monthEnd;
    });
    
    monthlyData.push({
      month: format(monthStart, 'MMM yyyy'),
      inquiries: monthInquiries.length,
      quotes: monthInquiries.filter(inq => inq.status === 'Quoted').length,
      bookings: monthInquiries.filter(inq => inq.status === 'Closed').length
    });
  }

  // Tour type distribution
  const tourTypeData = [
    {
      name: 'Domestic',
      value: filteredInquiries.filter(inq => inq.tour_type === 'domestic').length,
      color: '#0088FE'
    },
    {
      name: 'International',
      value: filteredInquiries.filter(inq => inq.tour_type === 'international').length,
      color: '#00C49F'
    }
  ];

  // Status distribution
  const statusData = [
    { name: 'New', value: filteredInquiries.filter(inq => inq.status === 'New').length, color: '#8884d8' },
    { name: 'Assigned', value: assignedInquiries, color: '#82ca9d' },
    { name: 'Quoted', value: quotedInquiries, color: '#ffc658' },
    { name: 'Closed', value: closedInquiries, color: '#ff7300' }
  ];

  // Top destinations
  const destinationCounts = filteredInquiries.reduce((acc, inq) => {
    acc[inq.destination] = (acc[inq.destination] || 0) + 1;
    return acc;
  }, {});
  
  const topDestinations = Object.entries(destinationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([destination, count]) => ({ destination, count }));

  // Agent performance
  const agentPerformance = filteredInquiries
    .filter(inq => inq.assigned_agent_name)
    .reduce((acc, inq) => {
      const agent = inq.assigned_agent_name;
      if (!acc[agent]) {
        acc[agent] = { total: 0, quoted: 0, closed: 0 };
      }
      acc[agent].total++;
      if (inq.status === 'Quoted') acc[agent].quoted++;
      if (inq.status === 'Closed') acc[agent].closed++;
      return acc;
    }, {});

  const agentStats = Object.entries(agentPerformance).map(([agent, stats]) => ({
    agent,
    ...stats,
    conversionRate: stats.total > 0 ? ((stats.quoted + stats.closed) / stats.total * 100).toFixed(1) : '0'
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-teal-600">Reports & Analytics</h1>
          <p className="text-gray-500 mt-2">Comprehensive insights into your business performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Quotes + Bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotedInquiries}</div>
            <p className="text-xs text-muted-foreground">
              Pending decisions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedInquiries}</div>
            <p className="text-xs text-muted-foreground">
              Successful bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inquiry Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
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
                <CardTitle>Tour Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={tourTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {tourTypeData.map((entry, index) => (
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

        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDestinations.map((dest, index) => (
                  <div key={dest.destination} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{dest.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{dest.count} inquiries</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-600 h-2 rounded-full" 
                          style={{ width: `${(dest.count / totalInquiries) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentStats.map((agent) => (
                  <div key={agent.agent} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{agent.agent}</h4>
                      <Badge variant="outline">{agent.conversionRate}% conversion</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total: </span>
                        <span className="font-medium">{agent.total}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quoted: </span>
                        <span className="font-medium">{agent.quoted}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Closed: </span>
                        <span className="font-medium">{agent.closed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inquiries" fill="#8884d8" name="Inquiries" />
                  <Bar dataKey="quotes" fill="#82ca9d" name="Quotes" />
                  <Bar dataKey="bookings" fill="#ffc658" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
