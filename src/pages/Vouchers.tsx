
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import VoucherTable from '../components/voucher/VoucherTable';
import VoucherFilters from '../components/voucher/VoucherFilters';
import VoucherStats from '../components/voucher/VoucherStats';

interface Voucher {
  id: string;
  voucher_reference: string;
  booking_id: string;
  issued_date: string;
  email_sent: boolean;
  notes?: string;
  bookings?: {
    client: string;
    hotel_name: string;
    travel_start: string;
    travel_end: string;
  };
}

const Vouchers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch vouchers with booking details
  const { data: vouchers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_vouchers')
        .select(`
          *,
          bookings (
            client,
            hotel_name,
            travel_start,
            travel_end
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Voucher[];
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      const voucher = vouchers.find(v => v.id === voucherId);
      if (!voucher) throw new Error('Voucher not found');

      const { error } = await supabase.functions.invoke('send-voucher-email', {
        body: { voucher, booking: voucher.bookings }
      });

      if (error) throw error;

      // Update the voucher as sent
      const { error: updateError } = await supabase
        .from('travel_vouchers')
        .update({ email_sent: true })
        .eq('id', voucherId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Voucher email sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
    onError: (error) => {
      console.error('Error sending voucher email:', error);
      toast.error('Failed to send voucher email. Please try again.');
    }
  });

  // Download PDF function
  const handleDownload = async (voucherId: string) => {
    try {
      // This would integrate with your PDF generation service
      toast.info('PDF download functionality coming soon!');
    } catch (error) {
      console.error('Error downloading voucher:', error);
      toast.error('Failed to download voucher PDF.');
    }
  };

  // Filter vouchers based on search and filters
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

  // Calculate stats
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

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Vouchers</CardTitle>
            <CardDescription className="text-red-600">
              There was an error loading your vouchers. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Travel Vouchers</h1>
          <p className="text-gray-600">Manage and track all your travel vouchers</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/bookings">
              <Plus className="h-4 w-4 mr-2" />
              Create Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <VoucherStats {...stats} />

      {/* Filters */}
      <VoucherFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        onClearFilters={clearFilters}
      />

      {/* Vouchers Table */}
      <VoucherTable
        vouchers={filteredVouchers.map(voucher => ({
          id: voucher.id,
          voucher_reference: voucher.voucher_reference,
          booking_id: voucher.booking_id,
          client_name: voucher.bookings?.client,
          hotel_name: voucher.bookings?.hotel_name,
          issued_date: voucher.issued_date,
          travel_dates: voucher.bookings 
            ? `${new Date(voucher.bookings.travel_start).toLocaleDateString()} - ${new Date(voucher.bookings.travel_end).toLocaleDateString()}`
            : undefined,
          status: voucher.email_sent ? 'sent' : 'pending',
          email_sent: voucher.email_sent
        }))}
        onSendEmail={(voucherId) => sendEmailMutation.mutate(voucherId)}
        onDownload={handleDownload}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Vouchers;
