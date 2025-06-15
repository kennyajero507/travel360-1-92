
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Send, CheckCircle, Clock } from 'lucide-react';

interface VoucherStatsProps {
  totalVouchers: number;
  sentVouchers: number;
  pendingVouchers: number;
  usedVouchers: number;
}

const VoucherStats = ({ totalVouchers, sentVouchers, pendingVouchers, usedVouchers }: VoucherStatsProps) => {
  const stats = [
    {
      title: 'Total Vouchers',
      value: totalVouchers,
      icon: <FileText className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Sent to Clients',
      value: sentVouchers,
      icon: <Send className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending',
      value: pendingVouchers,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Used',
      value: usedVouchers,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <div className={stat.color}>
                {stat.icon}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VoucherStats;
