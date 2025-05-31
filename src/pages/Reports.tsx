
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download } from "lucide-react";
import { Button } from "../components/ui/button";

const Reports = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Reports & Analytics
          </h1>
          <p className="text-lg text-gray-600 font-medium">Comprehensive insights into your travel business</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
                Sales Performance
              </CardTitle>
              <CardDescription>Monthly revenue and conversion metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-2xl font-bold text-green-600">$45,280</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Growth</span>
                  <span className="text-sm font-medium text-green-600">+18.5%</span>
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Users className="h-5 w-5" />
                Client Analytics
              </CardTitle>
              <CardDescription>Customer insights and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Clients</span>
                  <span className="text-2xl font-bold text-blue-600">342</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New This Month</span>
                  <span className="text-sm font-medium text-green-600">+28</span>
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <TrendingUp className="h-5 w-5" />
                Booking Trends
              </CardTitle>
              <CardDescription>Seasonal patterns and forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Peak Season</span>
                  <span className="text-sm font-medium text-purple-600">Dec - Feb</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Booking Value</span>
                  <span className="text-2xl font-bold text-purple-600">$2,850</span>
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Revenue Analytics</CardTitle>
              <CardDescription>Detailed financial performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                    <DollarSign className="h-6 w-6 mb-2" />
                    <div className="text-2xl font-bold">$125K</div>
                    <div className="text-sm opacity-90">Total Revenue</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <div className="text-2xl font-bold">22%</div>
                    <div className="text-sm opacity-90">Growth Rate</div>
                  </div>
                </div>
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Monthly Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Operational Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Inquiry Conversion Rate</span>
                  <span className="font-bold text-green-600">68%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Average Response Time</span>
                  <span className="font-bold text-blue-600">2.3 hrs</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Customer Satisfaction</span>
                  <span className="font-bold text-purple-600">4.8/5</span>
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
