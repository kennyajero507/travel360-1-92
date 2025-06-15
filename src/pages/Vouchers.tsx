
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { 
  Download, 
  FileDown,
  Mail, 
  FileText, 
  List,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Booking, TravelVoucher } from "../types/booking.types";
import { getAllVouchers, sendVoucherByEmail } from "../services/voucherService";
import { generateVoucherPDF } from "../services/pdfVoucherGenerator";

// Helper to use search params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Vouchers = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredVouchers, setFilteredVouchers] = useState<any[]>([]);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const navigate = useNavigate();
  const query = useQuery();
  const bookingIdFilter = query.get('bookingId');
  
  const loadVouchers = useCallback(async () => {
    try {
      const data = await getAllVouchers();
      setVouchers(data);
      
      // Apply filter if bookingId is provided
      if (bookingIdFilter) {
        setFilteredVouchers(data.filter(v => v.booking_id === bookingIdFilter));
      } else {
        setFilteredVouchers(data);
      }
    } catch (error) {
      console.error("Error loading vouchers:", error);
      toast.error("Failed to load vouchers data");
    }
  }, [bookingIdFilter]);
  
  // Load vouchers data
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        await loadVouchers();
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, [loadVouchers]);
  
  // Handle email sending
  const handleSendEmail = async (voucher: any) => {
    if (!voucher.bookings) {
      toast.error("Booking data is missing for this voucher.");
      return;
    }
    setSendingEmailId(voucher.id);
    try {
      toast.info("Sending voucher email...");
      await sendVoucherByEmail({ voucher: voucher as TravelVoucher, booking: voucher.bookings as Booking });
      // Refresh the list to show the updated status
      await loadVouchers();
    } catch (error) {
      // Error toast is handled by the service
      console.error("Error sending voucher email:", error);
    } finally {
      setSendingEmailId(null);
    }
  };
  
  // Handle download
  const handleDownload = (voucher: any) => {
    if (voucher && voucher.bookings) {
      generateVoucherPDF(voucher as TravelVoucher, voucher.bookings as Booking);
    } else {
      toast.error("Booking data for this voucher is missing and the PDF could not be generated.");
    }
  };
  
  // Clear filters
  const clearFilters = () => {
    navigate("/vouchers");
  };
  
  // View voucher details
  const viewVoucherDetails = (voucherId: string) => {
    navigate(`/vouchers/${voucherId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Travel Vouchers</h1>
          <p className="text-gray-500">Manage travel vouchers for confirmed bookings</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/bookings")}>
            <List className="h-4 w-4 mr-2" />
            All Bookings
          </Button>
          <Button variant="outline" onClick={() => navigate("/vouchers")}>
            <FileText className="h-4 w-4 mr-2" />
            All Vouchers
          </Button>
        </div>
      </div>
      
      {/* Filter notice */}
      {bookingIdFilter && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <div className="flex justify-between items-center">
            <p className="text-blue-700">
              Showing vouchers for Booking ID: {bookingIdFilter}
            </p>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-700">
              Clear Filter
            </Button>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Travel Vouchers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading vouchers data...</div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No vouchers found</p>
              <p className="text-sm text-gray-400 mt-2">Vouchers are generated when bookings are confirmed</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher Ref</TableHead>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Email Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">
                      {voucher.voucher_reference}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto" 
                        onClick={() => navigate(`/bookings/${voucher.booking_id}`)}
                      >
                        {voucher.bookings?.booking_reference || voucher.booking_id}
                      </Button>
                    </TableCell>
                    <TableCell>{voucher.bookings?.client || 'Unknown'}</TableCell>
                    <TableCell>{voucher.bookings?.hotel_name || 'Unknown'}</TableCell>
                    <TableCell>{new Date(voucher.issued_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {voucher.email_sent ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          Not Sent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => viewVoucherDetails(voucher.id)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload(voucher)}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        
                        {!voucher.email_sent && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSendEmail(voucher)}
                            disabled={sendingEmailId === voucher.id}
                          >
                            <Mail className="h-4 w-4" />
                            <span className="sr-only">Email</span>
                          </Button>
                        )}
                      </div>
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

export default Vouchers;
