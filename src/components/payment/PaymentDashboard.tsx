
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CreditCard, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { usePaymentData } from '../../hooks/usePaymentData';
import PaymentRecordsList from './PaymentRecordsList';
import PaymentSummaryCards from './PaymentSummaryCards';

const PaymentDashboard = () => {
  const { payments, isLoading } = usePaymentData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Management</h2>
          <p className="text-gray-600">Monitor and manage all payment transactions</p>
        </div>
      </div>

      <PaymentSummaryCards payments={payments} />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PaymentRecordsList payments={payments} />
        </TabsContent>

        <TabsContent value="pending">
          <PaymentRecordsList 
            payments={payments.filter(p => p.payment_status === 'pending')} 
          />
        </TabsContent>

        <TabsContent value="completed">
          <PaymentRecordsList 
            payments={payments.filter(p => p.payment_status === 'completed')} 
          />
        </TabsContent>

        <TabsContent value="failed">
          <PaymentRecordsList 
            payments={payments.filter(p => p.payment_status === 'failed')} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentDashboard;
