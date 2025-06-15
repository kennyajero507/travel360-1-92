import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { enhancedBookingService } from "../../services/enhancedBookingService";
import { Payment } from "../../types/enhanced-booking.types";
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RotateCcw
} from "lucide-react";
import RecordPaymentDialog from "./RecordPaymentDialog";

interface PaymentTrackerProps {
  bookingId: string;
  totalAmount: number;
}

const PaymentTracker = ({ bookingId, totalAmount }: PaymentTrackerProps) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [bookingId]);

  const loadPayments = async () => {
    try {
      const data = await enhancedBookingService.getPaymentsByBooking(bookingId);
      setPayments(data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId: string, status: string) => {
    await enhancedBookingService.updatePaymentStatus(paymentId, status);
    await loadPayments();
  };

  const getStatusBadge = (status: Payment['payment_status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-300', icon: Clock },
      completed: { color: 'bg-green-50 text-green-700 border-green-300', icon: CheckCircle },
      failed: { color: 'bg-red-50 text-red-700 border-red-300', icon: XCircle },
      refunded: { color: 'bg-gray-50 text-gray-700 border-gray-300', icon: RotateCcw }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalPaid = payments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const remainingAmount = totalAmount - totalPaid;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse bg-gray-200 h-40 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                ${totalAmount.toFixed(2)}
              </div>
              <div className="text-sm text-blue-600">Total Amount</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                ${totalPaid.toFixed(2)}
              </div>
              <div className="text-sm text-green-600">Paid Amount</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                ${remainingAmount.toFixed(2)}
              </div>
              <div className="text-sm text-yellow-600">Remaining</div>
            </div>
          </div>
          
          {/* Payment Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Payment Progress</span>
              <span>{((totalPaid / totalAmount) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((totalPaid / totalAmount) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </div>
            <RecordPaymentDialog 
              bookingId={bookingId} 
              onPaymentRecorded={loadPayments}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payments recorded yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      ${payment.amount.toFixed(2)} {payment.currency_code}
                    </TableCell>
                    <TableCell>{payment.payment_method || 'Not specified'}</TableCell>
                    <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
                    <TableCell>
                      {payment.payment_date 
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : new Date(payment.created_at).toLocaleDateString()
                      }
                    </TableCell>
                    <TableCell>
                      {payment.payment_status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(payment.id, 'completed')}
                            className="text-green-700 hover:bg-green-50"
                          >
                            Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(payment.id, 'failed')}
                            className="text-red-700 hover:bg-red-50"
                          >
                            Mark Failed
                          </Button>
                        </div>
                      )}
                      {payment.payment_status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(payment.id, 'refunded')}
                          className="text-gray-700 hover:bg-gray-50"
                        >
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracker;
