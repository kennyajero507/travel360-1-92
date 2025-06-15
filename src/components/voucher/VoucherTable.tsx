
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, Download, Mail, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Link } from 'react-router-dom';
import VoucherStatusBadge from './VoucherStatusBadge';

interface Voucher {
  id: string;
  voucher_reference: string;
  booking_id: string;
  client_name?: string;
  hotel_name?: string;
  issued_date: string;
  travel_dates?: string;
  status: 'pending' | 'issued' | 'sent' | 'used';
  email_sent: boolean;
}

interface VoucherTableProps {
  vouchers: Voucher[];
  onSendEmail: (voucherId: string) => void;
  onDownload: (voucherId: string) => void;
  isLoading?: boolean;
}

const VoucherTable = ({ vouchers, onSendEmail, onDownload, isLoading }: VoucherTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers found</h3>
        <p className="text-gray-500">Get started by creating your first booking to generate vouchers.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voucher Reference</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Hotel</TableHead>
            <TableHead>Issued Date</TableHead>
            <TableHead>Travel Dates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.map((voucher) => (
            <TableRow key={voucher.id}>
              <TableCell className="font-medium">
                <Link 
                  to={`/vouchers/${voucher.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {voucher.voucher_reference}
                </Link>
              </TableCell>
              <TableCell>{voucher.client_name || 'N/A'}</TableCell>
              <TableCell>{voucher.hotel_name || 'N/A'}</TableCell>
              <TableCell>{new Date(voucher.issued_date).toLocaleDateString()}</TableCell>
              <TableCell>{voucher.travel_dates || 'N/A'}</TableCell>
              <TableCell>
                <VoucherStatusBadge status={voucher.status} />
              </TableCell>
              <TableCell>
                {voucher.email_sent ? (
                  <Badge variant="outline" className="text-green-700 bg-green-50">
                    Sent
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-700 bg-gray-50">
                    Not sent
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/vouchers/${voucher.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(voucher.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                    {!voucher.email_sent && (
                      <DropdownMenuItem onClick={() => onSendEmail(voucher.id)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
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

export default VoucherTable;
