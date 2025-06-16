
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MoreHorizontal, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { PaymentRecord } from '../../services/paymentService';
import { usePaymentData } from '../../hooks/usePaymentData';
import { toast } from 'sonner';

interface PaymentRecordsListProps {
  payments: PaymentRecord[];
}

const PaymentRecordsList = ({ payments }: PaymentRecordsListProps) => {
  const { updatePaymentStatus } = usePaymentData();

  const getStatusColor = (status: PaymentRecord['payment_status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: PaymentRecord['payment_status']) => {
    try {
      await updatePaymentStatus(paymentId, newStatus);
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No payment records found</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-mono text-sm">
                {payment.id.slice(0, 8)}...
              </TableCell>
              <TableCell className="font-medium">
                ${Number(payment.amount).toLocaleString()} {payment.currency_code}
              </TableCell>
              <TableCell>{payment.payment_method || 'N/A'}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(payment.payment_status)}>
                  {payment.payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                {payment.payment_date 
                  ? new Date(payment.payment_date).toLocaleDateString()
                  : new Date(payment.created_at || '').toLocaleDateString()
                }
              </TableCell>
              <TableCell>
                {payment.booking_id ? (
                  <span className="font-mono text-sm">
                    {payment.booking_id.slice(0, 8)}...
                  </span>
                ) : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {payment.payment_status === 'pending' && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(payment.id, 'completed')}
                        >
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(payment.id, 'failed')}
                        >
                          Mark as Failed
                        </DropdownMenuItem>
                      </>
                    )}
                    {payment.payment_status === 'completed' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(payment.id, 'refunded')}
                      >
                        Process Refund
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentRecordsList;
