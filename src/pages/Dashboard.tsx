
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar,
  Plus,
  TrendingUp,
  DollarSign,
  Building2,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminSetup from "../components/admin/AdminSetup";

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  const stats = [
    { title: "Total Quotes", value: "24", icon: FileText, change: "+12%", color: "text-blue-600" },
    { title: "Active Bookings", value: "8", icon: Calendar, change: "+5%", color: "text-green-600" },
    { title: "Revenue", value: "$45,231", icon: DollarSign, change: "+18%", color: "text-purple-600" },
    { title: "Clients", value: "156", icon: Users, change: "+7%", color: "text-orange-600" },
  ];

  const quickActions = [
    { title: "Create Quote", description: "Generate a new travel quote", href: "/app/quotes/create", icon: FileText },
    { title: "New Inquiry", description: "Add a new client inquiry", href: "/app/inquiries/create", icon: Users },
    { title: "Add Hotel", description: "Register a new hotel", href: "/app/hotels/create", icon: Building2 },
    { title: "View Reports", description: "Check analytics and reports", href: "/app/reports", icon: BarChart3 },
  ];

  const isAdmin = userProfile?.role === 'system_admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {userProfile?.full_name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your travel business today.
          </p>
        </div>
        {isAdmin && (
          <Button 
            variant="outline" 
            onClick={() => setShowAdminSetup(!showAdminSetup)}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Setup
          </Button>
        )}
      </div>

      {/* Admin Setup Panel */}
      {showAdminSetup && isAdmin && (
        <div className="mb-6">
          <AdminSetup />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link to={action.href}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span>{action.title}</span>
                  </CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">Safari Adventure - Kenya</div>
                  <div className="text-sm text-gray-500">John Smith</div>
                </div>
                <div className="text-sm text-gray-400">2 hours ago</div>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">Beach Resort - Maldives</div>
                  <div className="text-sm text-gray-500">Jane Doe</div>
                </div>
                <div className="text-sm text-gray-400">5 hours ago</div>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">Cultural Tour - Morocco</div>
                  <div className="text-sm text-gray-500">Mike Johnson</div>
                </div>
                <div className="text-sm text-gray-400">1 day ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">Mount Kilimanjaro Trek</div>
                  <div className="text-sm text-gray-500">Starts March 15</div>
                </div>
                <div className="text-sm text-green-600">Confirmed</div>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">Serengeti Safari</div>
                  <div className="text-sm text-gray-500">Starts March 20</div>
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">Zanzibar Beach Holiday</div>
                  <div className="text-sm text-gray-500">Starts March 25</div>
                </div>
                <div className="text-sm text-green-600">Confirmed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
