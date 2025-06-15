
import { useState, useMemo } from 'react';

interface Voucher {
  id: string;
  voucher_reference: string;
  booking_id: string;
  issued_date: string;
  email_sent: boolean;
  bookings?: {
    client: string;
    hotel_name: string;
    travel_start: string;
    travel_end: string;
  };
}

export const useVoucherFilters = (vouchers: Voucher[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(voucher => {
      const matchesSearch = !searchTerm || 
        voucher.voucher_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.bookings?.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.bookings?.hotel_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'sent' && voucher.email_sent) ||
        (statusFilter === 'pending' && !voucher.email_sent);

      const matchesDate = dateFilter === 'all' || (() => {
        const voucherDate = new Date(voucher.issued_date);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            return voucherDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return voucherDate >= weekAgo;
          case 'month':
            return voucherDate.getMonth() === now.getMonth() && 
                   voucherDate.getFullYear() === now.getFullYear();
          case 'quarter':
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            return voucherDate >= quarterStart;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [vouchers, searchTerm, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const total = vouchers.length;
    const sent = vouchers.filter(v => v.email_sent).length;
    const pending = vouchers.filter(v => !v.email_sent).length;
    const used = 0; // This would need to be tracked in your system

    return {
      totalVouchers: total,
      sentVouchers: sent,
      pendingVouchers: pending,
      usedVouchers: used
    };
  }, [vouchers]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    filteredVouchers,
    stats,
    clearFilters
  };
};
