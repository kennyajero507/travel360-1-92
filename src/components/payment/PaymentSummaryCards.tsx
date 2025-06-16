
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { PaymentRecord } from '../../services/paymentService';

interface PaymentSummaryCardsProps {
  payments: PaymentRecord[];
}

const PaymentSummaryCards = ({ payments }: PaymentSummaryCardsProps) => {
  const totalAmount = payments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingAmount = payments
    .filter(p => p.payment_status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const failedCount = payments.filter(p => p.payment_status === 'failed').length;

  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.created_at || '');
    const now = new Date();
    return paymentDate.getMonth() === now.getMonth() && 
           paymentDate.getFullYear() === now.getFullYear();
  });

  const thisMonthAmount = thisMonthPayments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            From {payments.filter(p => p.payment_status === 'completed').length} payments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {payments.filter(p => p.payment_status === 'pending').length} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${thisMonthAmount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {thisMonthPayments.length} payments this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{failedCount}</div>
          <p className="text-xs text-muted-foreground">
            Requires attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSummaryCards;
