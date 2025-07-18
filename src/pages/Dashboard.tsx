import { useState, useEffect } from "react";
import { useSimpleAuth } from "../contexts/SimpleAuthContext";
import OrganizationSetup from "../components/OrganizationSetup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FileText, Users, Calendar, ArrowUp, MessageSquare, Receipt, ClipboardList, TrendingUp, BarChart3, Zap } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useDashboardStats } from "../hooks/useDashboardStats";
import EnhancedAnalyticsDashboard from "../components/analytics/EnhancedAnalyticsDashboard";
import QuickActionsPanel from "../components/analytics/QuickActionsPanel";
import { errorHandler } from "@/services/errorHandlingService";
import { toast } from "sonner";

const Dashboard = () => {
  const { profile, loading } = useSimpleAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show organization setup if user doesn't have one and is org_owner
  // Only redirect org_owners to setup, other roles can access dashboard without org
  if (profile && !profile.org_id && profile.role === 'org_owner') {
    return <OrganizationSetup />;
  }

  const isAgent = profile?.role === 'agent';
  
  // Example quick action form for validation and error demo
  const [quickAction, setQuickAction] = useState("");
  const [quickActionError, setQuickActionError] = useState("");

  const handleQuickAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAction.trim()) {
      setQuickActionError("This field is required!");
      return;
    }
    setQuickActionError("");
    try {
      // Optional: Simulate action (could be a Supabase call)
      // throw new Error("Simulated dashboard error");
      toast.success("Quick action executed!");
    } catch (err: any) {
      errorHandler.handleError(err, "Dashboard Quick Action");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 font-medium">Welcome back! Here's what's happening with your business.</p>
          {profile && (
            <div className="mt-2 text-sm text-gray-500">
              <p>Role: <span className="font-medium">{profile.role}</span></p>
              {profile.org_id ? (
                <p>Organization: <span className="font-medium">Organization ID: {profile.org_id}</span></p>
              ) : (
                <p className="text-orange-600">No organization assigned</p>
              )}
            </div>
          )}
        </div>

        {/* Show organization setup prompt for non-org_owner users without org */}
        {profile && !profile.org_id && profile.role !== 'org_owner' && (
          <div className="mb-8">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Organization Setup Required</CardTitle>
                <CardDescription className="text-orange-600">
                  You're not currently associated with an organization. Contact your administrator or create your own organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link to="/organization/setup">Set Up Organization</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                  title="Active Inquiries" 
                  value={statsLoading ? "..." : (stats?.activeInquiries ?? 0).toString()}
                  trend="+12%" 
                  description="vs. last month" 
                  icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
                  color="blue"
                />
                <MetricCard 
                  title="Pending Quotes" 
                  value={statsLoading ? "..." : (stats?.pendingQuotes ?? 0).toString()}
                  trend="+8%" 
                  description="vs. last month" 
                  icon={<Receipt className="h-6 w-6 text-green-600" />}
                  color="green"
                />
                <MetricCard 
                  title="Active Bookings" 
                  value={statsLoading ? "..." : (stats?.activeBookings ?? 0).toString()}
                  trend="+15%" 
                  description="vs. last month" 
                  icon={<ClipboardList className="h-6 w-6 text-purple-600" />}
                  color="purple"
                />
                <MetricCard 
                  title="Revenue" 
                  value={statsLoading ? "..." : `$${((stats?.revenue ?? 0) / 1000).toFixed(0)}K`}
                  trend="+22%" 
                  description="vs. last month" 
                  icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
                  color="orange"
                />
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      New Inquiry
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Start a new client inquiry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                      <Link to="/inquiries/create">Create Inquiry</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Create Quote
                    </CardTitle>
                    <CardDescription className="text-green-100">
                      Generate a new quote
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="secondary" className="w-full bg-white text-green-600 hover:bg-green-50">
                      <Link to="/quotes/create">Create Quote</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      View Bookings
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Manage active bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="secondary" className="w-full bg-white text-purple-600 hover:bg-purple-50">
                      <Link to="/bookings">View Bookings</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Rate */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800">Conversion Analytics</CardTitle>
                    <CardDescription className="text-gray-600">Last 30 days performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span className="font-medium text-gray-700">Inquiry to Quote</span>
                        </div>
                        <span className="font-bold text-green-600">68%</span>
                      </div>
                      <Progress value={68} className="h-3 bg-green-100" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                          <span className="font-medium text-gray-700">Quote to Booking</span>
                        </div>
                        <span className="font-bold text-blue-600">45%</span>
                      </div>
                      <Progress value={45} className="h-3 bg-blue-100" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-purple-500" />
                          <span className="font-medium text-gray-700">Overall Conversion</span>
                        </div>
                        <span className="font-bold text-purple-600">31%</span>
                      </div>
                      <Progress value={31} className="h-3 bg-purple-100" />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Activities */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800">Recent Activities</CardTitle>
                    <CardDescription className="text-gray-600">Latest system activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <ActivityItem 
                        action="New inquiry received" 
                        client="Sarah Johnson" 
                        details="Zanzibar Beach Holiday - 7 nights" 
                        time="2 hours ago"
                        type="inquiry"
                      />
                      <ActivityItem 
                        action="Quote approved" 
                        client="Michael Chen" 
                        details="Serengeti Safari - $4,850" 
                        time="5 hours ago"
                        type="quote"
                      />
                      <ActivityItem 
                        action="Booking confirmed" 
                        client="Emily Rodriguez" 
                        details="Nairobi City Tour - $1,200" 
                        time="Yesterday"
                        type="booking"
                      />
                      <ActivityItem 
                        action="Voucher issued" 
                        client="David Kim" 
                        details="Mombasa Beach Resort" 
                        time="2 days ago"
                        type="voucher"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <EnhancedAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="actions">
            <QuickActionsPanel />
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Detailed activity feed and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500">Detailed activity timeline coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Example quick action form with validation */}
      <form className="mb-8 max-w-sm" onSubmit={handleQuickAction}>
        <label className="block text-sm mb-1 font-medium">
          Try a quick action
        </label>
        <input
          className={`border rounded px-2 py-1 w-full ${
            quickActionError ? "border-red-400" : ""
          }`}
          value={quickAction}
          onChange={e => setQuickAction(e.target.value)}
          placeholder="Type something..."
        />
        {quickActionError && (
          <div className="text-xs text-red-600 mt-1">{quickActionError}</div>
        )}
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
          type="submit"
        >
          Run
        </button>
      </form>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard = ({ title, value, trend, description, icon, color }: MetricCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            {icon}
          </div>
          <div className="flex items-center text-sm text-green-600 font-medium">
            <ArrowUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  action: string;
  client: string;
  details: string;
  time: string;
  type: 'inquiry' | 'quote' | 'booking' | 'voucher';
}

const ActivityItem = ({ action, client, details, time, type }: ActivityItemProps) => {
  const iconMap = {
    inquiry: <MessageSquare className="h-4 w-4 text-blue-600" />,
    quote: <Receipt className="h-4 w-4 text-green-600" />,
    booking: <ClipboardList className="h-4 w-4 text-purple-600" />,
    voucher: <FileText className="h-4 w-4 text-orange-600" />
  };

  const bgMap = {
    inquiry: 'bg-blue-100',
    quote: 'bg-green-100', 
    booking: 'bg-purple-100',
    voucher: 'bg-orange-100'
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`h-8 w-8 rounded-full ${bgMap[type]} flex items-center justify-center`}>
        {iconMap[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{action}</p>
        <p className="text-sm text-gray-600">{client} - {details}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
