
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import VoucherTable from '../components/voucher/VoucherTable';
import VoucherFilters from '../components/voucher/VoucherFilters';
import VoucherStats from '../components/voucher/VoucherStats';
import { useVoucherData } from '../hooks/useVoucherData';
import { useVoucherActions } from '../hooks/useVoucherActions';
import { useVoucherFilters } from '../hooks/useVoucherFilters';

const Vouchers = () => {
  const { data: vouchers = [], isLoading, error, refetch } = useVoucherData();
  const { sendEmail, handleDownload } = useVoucherActions();
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    filteredVouchers,
    stats,
    clearFilters
  } = useVoucherFilters(vouchers);

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
        onSendEmail={sendEmail}
        onDownload={handleDownload}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Vouchers;
