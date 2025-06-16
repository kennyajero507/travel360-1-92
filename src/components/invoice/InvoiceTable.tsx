import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MoreHorizontal, Send, Download, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Invoice } from '../../types/invoice.types';
import MobileOptimizedTable from '../mobile/MobileOptimizedTable';
import { useIsMobile } from '../../hooks/use-mobile';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onSendInvoice: (invoiceId: string) => void;
  onDownloadInvoice: (invoiceId: string) => void;
}

const InvoiceTable = ({ invoices, isLoading, onSendInvoice, onDownloadInvoice }: InvoiceTableProps) => {
  const isMobile = useIsMobile();

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No invoices found</div>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    const mobileItems = invoices.map(invoice => ({
      id: invoice.id,
      title: invoice.invoice_number,
      subtitle: invoice.client_name,
      status: invoice.status,
      statusColor: getStatusColor(invoice.status),
      metadata: [
        { label: 'Amount', value: `$${Number(invoice.amount).toLocaleString()}` },
        { label: 'Due Date', value: invoice.due_date || 'No due date' }
      ],
      actions: (
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
            {invoice.status === 'draft' && (
              <DropdownMenuItem onClick={() => onSendInvoice(invoice.id)}>
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDownloadInvoice(invoice.id)}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }));

    return <MobileOptimizedTable items={mobileItems} />;
  }

  // Desktop view
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.client_name}</TableCell>
              <TableCell>${Number(invoice.amount).toLocaleString()} {invoice.currency_code}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
              </TableCell>
              <TableCell>
                {new Date(invoice.created_at || '').toLocaleDateString()}
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
                    {invoice.status === 'draft' && (
                      <DropdownMenuItem onClick={() => onSendInvoice(invoice.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invoice
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDownloadInvoice(invoice.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
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

export default InvoiceTable;
