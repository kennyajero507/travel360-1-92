
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Users, 
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react';

interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  timestamp: string;
  metadata?: any;
}

interface SystemEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  message?: string;
  metadata?: any;
  created_at: string;
}

const SystemMonitoring = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      await Promise.all([
        fetchSystemMetrics(),
        fetchSystemEvents(),
        fetchSystemHealth()
      ]);
    } catch (error) {
      console.error('Error fetching system data:', error);
      toast.error('Failed to fetch system monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemMetrics = async () => {
    const { data, error } = await supabase
      .from('system_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) throw error;
    setMetrics(data || []);
  };

  const fetchSystemEvents = async () => {
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    setEvents(data || []);
  };

  const fetchSystemHealth = async () => {
    // Get various system health metrics
    const [usersCount, orgsCount, activeQuotes, systemUptime] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('organizations').select('id', { count: 'exact' }),
      supabase.from('quotes').select('id', { count: 'exact' }).eq('status', 'draft'),
      // Mock uptime for now
      Promise.resolve({ uptime: 99.9 })
    ]);

    setSystemHealth({
      totalUsers: usersCount.count || 0,
      totalOrganizations: orgsCount.count || 0,
      activeQuotes: activeQuotes.count || 0,
      uptime: 99.9,
      responseTime: Math.random() * 100 + 50, // Mock response time
      errorRate: Math.random() * 2, // Mock error rate
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getHealthStatus = () => {
    const { uptime, errorRate } = systemHealth;
    if (uptime >= 99.5 && errorRate < 1) return { status: 'healthy', color: 'text-green-600' };
    if (uptime >= 95 && errorRate < 5) return { status: 'warning', color: 'text-yellow-600' };
    return { status: 'critical', color: 'text-red-600' };
  };

  const healthStatus = getHealthStatus();

  if (loading) {
    return <div className="text-center py-8">Loading system monitoring data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className={`text-2xl font-bold ${healthStatus.color}`}>
                  {healthStatus.status.toUpperCase()}
                </p>
              </div>
              <CheckCircle className={`h-8 w-8 ${healthStatus.color}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">{systemHealth.uptime}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={systemHealth.uptime} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">{Math.round(systemHealth.responseTime)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold">{systemHealth.errorRate?.toFixed(2)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{systemHealth.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organizations</p>
                <p className="text-2xl font-bold">{systemHealth.totalOrganizations}</p>
              </div>
              <Database className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Quotes</p>
                <p className="text-2xl font-bold">{systemHealth.activeQuotes}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent System Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent System Events
            </div>
            <Button variant="outline" size="sm" onClick={fetchSystemData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length > 0 ? events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.event_type}</TableCell>
                  <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                  <TableCell>{event.source || 'System'}</TableCell>
                  <TableCell className="max-w-xs truncate">{event.message || 'N/A'}</TableCell>
                  <TableCell>{new Date(event.created_at).toLocaleString()}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No system events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length > 0 ? metrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">{metric.metric_name}</TableCell>
                  <TableCell>{metric.metric_value}</TableCell>
                  <TableCell>{metric.metric_unit}</TableCell>
                  <TableCell>{new Date(metric.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No metrics data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;
