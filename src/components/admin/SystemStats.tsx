
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Building, FileText, DollarSign } from "lucide-react";
import { supabase } from "../../integrations/supabase/client";

const SystemStats = () => {
  // Fetch system statistics
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      try {
        // Get user count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get organization count
        const { count: orgCount } = await supabase
          .from('organizations')
          .select('*', { count: 'exact', head: true });

        // Get quote count
        const { count: quoteCount } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true });

        // Get booking count
        const { count: bookingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });

        return {
          users: userCount || 0,
          organizations: orgCount || 0,
          quotes: quoteCount || 0,
          bookings: bookingCount || 0,
        };
      } catch (error) {
        console.error('Error fetching system stats:', error);
        throw error;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-red-600">
            Error loading system statistics. Please check your database connection.
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsData = [
    {
      title: "Total Users",
      value: stats?.users || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Organizations",
      value: stats?.organizations || 0,
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Quotes",
      value: stats?.quotes || 0,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Bookings",
      value: stats?.bookings || 0,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                Live database count
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SystemStats;
