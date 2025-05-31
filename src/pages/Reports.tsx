
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart3, Users, MessageSquare, Receipt, ClipboardList, TrendingUp, Calendar } from "lucide-react";

const Reports = () => {
  const [dateRange, setDateRange] = useState("this-month");

  // Mock data for reports
  const inquiryStats = {
    total: 156,
    domestic: 89,
    international: 67,
    new: 23,
    assigned: 45,
    converted: 67,
    closed: 21
  };

  const quoteStats = {
    total: 89,
    pending: 23,
    approved: 45,
    rejected: 12,
    expired: 9,
    averageValue: 2850
  };

  const bookingStats = {
    total: 45,
    confirmed: 32,
    cancelled: 8,
    pending: 5,
    revenue: 128450
  };

  const agentPerformance = [
    { name: "John Doe", inquiries: 34, quotes: 23, bookings: 12, revenue: 34200 },
    { name: "Sarah Smith", inquiries: 28, quotes: 19, bookings: 10, revenue: 28500 },
    { name: "Michael Brown", inquiries: 22, quotes: 15, bookings: 8, revenue: 22100 },
    { name: "Emily Johnson", inquiries: 19, quotes: 12, bookings: 6, revenue: 18700 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Reports & Analytics</h1>
          <p className="text-gray-500 mt-2">Comprehensive business intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inquiryStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quoteStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookingStats.confirmed}</div>
                <p className="text-xs text-muted-foreground">
                  +23% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${bookingStats.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +18% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Inquiries</span>
                    <span className="font-bold">{inquiryStats.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Quotes Generated</span>
                    <span className="font-bold">{quoteStats.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '57%'}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Bookings Confirmed</span>
                    <span className="font-bold">{bookingStats.confirmed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '36%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Revenue chart visualization would go here</p>
                  <p className="text-sm text-gray-400 mt-2">Integration with charting library needed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inquiry Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>New</span>
                    <span className="font-bold text-blue-600">{inquiryStats.new}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned</span>
                    <span className="font-bold text-yellow-600">{inquiryStats.assigned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Converted</span>
                    <span className="font-bold text-green-600">{inquiryStats.converted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Closed</span>
                    <span className="font-bold text-gray-600">{inquiryStats.closed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tour Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Domestic</span>
                    <span className="font-bold">{inquiryStats.domestic}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '57%'}}></div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>International</span>
                    <span className="font-bold">{inquiryStats.international}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '43%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">2.4h</div>
                    <p className="text-sm text-gray-500">Average Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">94%</div>
                    <p className="text-sm text-gray-500">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pending Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{quoteStats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Approved Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{quoteStats.approved}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rejected Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{quoteStats.rejected}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">${quoteStats.averageValue}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Confirmed</span>
                    <span className="font-bold text-green-600">{bookingStats.confirmed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="font-bold text-yellow-600">{bookingStats.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelled</span>
                    <span className="font-bold text-red-600">{bookingStats.cancelled}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">${bookingStats.revenue.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xs text-gray-400 mt-2">${(bookingStats.revenue / bookingStats.confirmed).toFixed(0)} avg per booking</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">51%</div>
                  <p className="text-sm text-gray-500">Quote to Booking</p>
                  <p className="text-xs text-gray-400 mt-2">Above industry average</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Agent Name</th>
                      <th className="text-right p-2">Inquiries</th>
                      <th className="text-right p-2">Quotes</th>
                      <th className="text-right p-2">Bookings</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentPerformance.map((agent, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{agent.name}</td>
                        <td className="text-right p-2">{agent.inquiries}</td>
                        <td className="text-right p-2">{agent.quotes}</td>
                        <td className="text-right p-2">{agent.bookings}</td>
                        <td className="text-right p-2">${agent.revenue.toLocaleString()}</td>
                        <td className="text-right p-2">{Math.round((agent.bookings / agent.quotes) * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
