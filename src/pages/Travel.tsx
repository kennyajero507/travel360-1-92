import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Plus, FileText, BookOpen, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import existing components
import { useQuoteData } from '../hooks/useQuoteData';
import { useBookingData } from '../hooks/useBookingData';
import { useVoucherData } from '../hooks/useVoucherData';
import { useVoucherActions } from '../hooks/useVoucherActions';

const Travel = () => {
  const [activeTab, setActiveTab] = useState('quotes');
  
  // Data hooks - fixed destructuring
  const { quotes = [], isLoading: quotesLoading } = useQuoteData();
  const { bookings = [], isLoading: bookingsLoading } = useBookingData();
  const { data: vouchers = [], isLoading: vouchersLoading } = useVoucherData();
  const { sendEmail, handleDownload } = useVoucherActions();

  const stats = {
    quotes: quotes.length,
    activeQuotes: quotes.filter(q => q.status === 'active').length,
    bookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    vouchers: vouchers.length,
    sentVouchers: vouchers.filter(v => v.email_sent).length
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Travel Management</h1>
          <p className="text-gray-600">Manage quotes, bookings, and vouchers in one place</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button asChild variant="outline">
            <Link to="/inquiries/create">
              <Plus className="h-4 w-4 mr-2" />
              New Inquiry
            </Link>
          </Button>
          <Button asChild>
            <Link to="/quotes/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quotes}</div>
            <p className="text-xs text-muted-foreground">{stats.activeQuotes} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookings}</div>
            <p className="text-xs text-muted-foreground">{stats.confirmedBookings} confirmed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
            <Plane className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vouchers}</div>
            <p className="text-xs text-muted-foreground">{stats.sentVouchers} sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Unified Travel Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Quotes
            {stats.quotes > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.quotes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Bookings
            {stats.bookings > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.bookings}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Vouchers
            {stats.vouchers > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.vouchers}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              {quotesLoading ? (
                <p>Loading quotes...</p>
              ) : quotes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No quotes yet. Create your first quote!</p>
                  <Button asChild className="mt-4">
                    <Link to="/quotes/create">Create Quote</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {quotes.slice(0, 10).map(quote => (
                    <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{quote.client}</div>
                        <div className="text-sm text-gray-500">{quote.destination}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={quote.status === 'active' ? 'default' : 'secondary'}>
                          {quote.status}
                        </Badge>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/quotes/${quote.id}`}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <p>Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No bookings yet. Convert quotes to bookings!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookings.slice(0, 10).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{booking.client}</div>
                        <div className="text-sm text-gray-500">{booking.hotel_name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/bookings/${booking.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Vouchers</CardTitle>
            </CardHeader>
            <CardContent>
              {vouchersLoading ? (
                <p>Loading vouchers...</p>
              ) : vouchers.length === 0 ? (
                <div className="text-center py-8">
                  <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No vouchers yet. Generate from bookings!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vouchers.slice(0, 10).map(voucher => (
                    <div key={voucher.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{voucher.voucher_reference}</div>
                        <div className="text-sm text-gray-500">
                          {voucher.bookings?.client || 'Unknown Client'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={voucher.email_sent ? 'default' : 'secondary'}>
                          {voucher.email_sent ? 'Sent' : 'Pending'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(voucher.id)}
                        >
                          Download
                        </Button>
                        {!voucher.email_sent && (
                          <Button
                            size="sm"
                            onClick={() => sendEmail(voucher.id)}
                          >
                            Send Email
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Travel;
