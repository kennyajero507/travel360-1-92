import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  Download,
  Calendar,
  DollarSign,
  Target,
  Timer
} from 'lucide-react';
import { useQuoteAnalytics } from '../../hooks/useQuoteAnalytics';
import { formatCurrency } from '../../utils/quoteCalculations';

interface QuoteAnalyticsDashboardProps {
  orgId?: string;
}

const QuoteAnalyticsDashboard: React.FC<QuoteAnalyticsDashboardProps> = ({ orgId }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { analytics, loading, fetchAnalytics } = useQuoteAnalytics(dateRange);

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const statCards = [
    {
      title: 'Total Quotes',
      value: analytics.totalQuotes.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All time quotes created'
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.conversionRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Accepted vs total quotes'
    },
    {
      title: 'Total Value',
      value: formatCurrency(analytics.totalValue, 'USD'),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Total quote value'
    },
    {
      title: 'Avg Response Time',
      value: `${analytics.responseTime.toFixed(1)} days`,
      icon: Timer,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Average client response time'
    },
    {
      title: 'Quote Views',
      value: analytics.viewCount.toString(),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Total quote views by clients'
    },
    {
      title: 'Downloads',
      value: analytics.downloadCount.toString(),
      icon: Download,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Total PDF downloads'
    }
  ];

  const statusCards = [
    {
      title: 'Accepted',
      count: analytics.acceptedQuotes,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending',
      count: analytics.pendingQuotes,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Rejected',
      count: analytics.rejectedQuotes,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quote Analytics</h2>
          <p className="text-gray-600">Track your quote performance and conversion rates</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-auto"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-auto"
            />
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Update
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {statusCards.map((status, index) => {
              const Icon = status.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex p-3 rounded-full ${status.bgColor} mb-2`}>
                    <Icon className={`h-6 w-6 ${status.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                  <p className="text-sm text-gray-600">{status.title}</p>
                  <Badge variant="secondary" className="mt-1">
                    {analytics.totalQuotes > 0 
                      ? `${((status.count / analytics.totalQuotes) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      {analytics.monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.monthlyData.slice(-6).map((month: any) => {
                const conversionRate = month.quotes > 0 ? (month.accepted / month.quotes) * 100 : 0;
                return (
                  <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {month.quotes} quotes • {month.accepted} accepted
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(month.value, 'USD')}
                      </p>
                      <Badge variant={conversionRate >= 50 ? 'default' : 'secondary'}>
                        {conversionRate.toFixed(1)}% conversion
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.conversionRate > 60 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  Excellent conversion rate! Your quotes are performing very well.
                </p>
              </div>
            )}
            
            {analytics.responseTime > 7 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Consider follow-up strategies - average response time is {analytics.responseTime.toFixed(1)} days.
                </p>
              </div>
            )}

            {analytics.viewCount > 0 && analytics.downloadCount / analytics.viewCount < 0.3 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Low download rate - consider improving quote presentation or adding clear CTAs.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteAnalyticsDashboard;