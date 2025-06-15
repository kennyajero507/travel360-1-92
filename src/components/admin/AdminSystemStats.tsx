
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { BarChart3, Users, Database, Gauge } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../integrations/supabase/client";

const fetchAdminStats = async () => {
  // Fetch total users
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Fetch total organizations
  const { count: orgCount } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true });

  // Fetch total bookings and revenue
  const { count: bookingCount, data: bookingRows } = await supabase
    .from("bookings")
    .select("total_price", { count: "exact" });

  const revenue =
    Array.isArray(bookingRows)
      ? bookingRows.reduce((sum, b) => sum + (b.total_price || 0), 0)
      : 0;

  return {
    userCount: userCount || 0,
    orgCount: orgCount || 0,
    bookingCount: bookingCount || 0,
    revenue: revenue || 0,
  };
};

const AdminSystemStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminSystemStats"],
    queryFn: fetchAdminStats,
    refetchInterval: 15000, // auto-refresh every 15s
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-4">Loading platform stats...</div>;
  }
  if (error) {
    return <div className="text-red-500 py-4">Failed to load stats</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Users className="text-blue-600" />
          <CardTitle className="text-base font-medium">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{data.userCount}</span>
          <CardDescription className="text-gray-500 text-xs">Total platform users</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Database className="text-green-600" />
          <CardTitle className="text-base font-medium">Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{data.orgCount}</span>
          <CardDescription className="text-gray-500 text-xs">Total organizations</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <BarChart3 className="text-purple-600" />
          <CardTitle className="text-base font-medium">Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{data.bookingCount}</span>
          <CardDescription className="text-gray-500 text-xs">Bookings on platform</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Gauge className="text-yellow-600" />
          <CardTitle className="text-base font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">${data.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <CardDescription className="text-gray-500 text-xs">All-time revenue</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemStats;
