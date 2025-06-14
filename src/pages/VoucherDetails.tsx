import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { 
  ArrowLeft, 
  CalendarDays, 
  Download, 
  FileText, 
  Hotel, 
  Mail, 
  MapPin, 
  Phone, 
  UserRound 
} from "lucide-react";
import { toast } from "sonner";
import { TravelVoucher } from "../types/booking.types";
import { getVoucherById, updateVoucherEmailStatus } from "../services/voucherService";
import { getBookingById } from "../services/bookingReadService";

const VoucherPreview = () => {
  const { voucherId } = useParams<{ voucherId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState<TravelVoucher | null>(null);
  const [booking, setBooking] = useState<any | null>(null);
  
  // Load voucher data
  useEffect(() => {
    const loadVoucherData = async () => {
      if (!voucherId) return;
      
      try {
        const voucherData = await getVoucherById(voucherId);
        setVoucher(voucherData);
        
        if (voucherData) {
          const bookingData = await getBookingById(voucherData.booking_id);
          setBooking(bookingData);
        }
      } catch (error) {
        console.error("Error loading voucher data:", error);
        toast.error("Failed to load voucher details");
      } finally {
        setLoading(false);
      }
    };
    
    loadVoucherData();
  }, [voucherId]);
  
  // Handle email sending
  const handleSendEmail = async () => {
    if (!voucher) return;
    
    try {
      // In a real app, this would call an API to send the email
      await updateVoucherEmailStatus(voucher.id, true);
      
      // Update local state
      setVoucher(prev => prev ? { ...prev, email_sent: true } : null);
      
      toast.success("Voucher sent to client via email");
    } catch (error) {
      console.error("Error sending voucher email:", error);
      toast.error("Failed to send voucher email");
    }
  };
  
  // Handle download
  const handleDownload = () => {
    // In a real app, this would download the voucher PDF
    toast.success("Voucher downloaded successfully");
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading voucher details...</div>;
  }
  
  if (!voucher || !booking) {
    return (
      <div className="text-center py-8">
        <p>Voucher not found or unable to load voucher data.</p>
        <Button className="mt-4" onClick={() => navigate("/vouchers")}>
          Return to Vouchers
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 mb-2" 
          onClick={() => navigate("/vouchers")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vouchers
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Travel Voucher</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {!voucher.email_sent && (
              <Button onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email to Client
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Voucher Preview */}
      <Card className="border border-gray-300 shadow-lg">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-blue-800">
                Travel Voucher #{voucher.voucher_reference}
              </CardTitle>
              <p className="text-blue-600">
                Booking Reference: {booking.booking_reference}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Issued Date</p>
              <p>{new Date(voucher.issued_date).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Client Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserRound className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-lg">Guest Information</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Guest Name</p>
                  <p className="font-medium">{booking.client}</p>
                </div>
                {/* Add more guest details if available */}
              </div>
            </div>
          </div>
          
          {/* Hotel Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Hotel className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-lg">Hotel Information</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Hotel Name</p>
                  <p className="font-medium">{booking.hotel_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Travel Period</p>
                  <p>
                    {new Date(booking.travel_start).toLocaleDateString()} to {new Date(booking.travel_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Room Details</p>
                {Array.isArray(booking.room_arrangement) && booking.room_arrangement.map((room: any, index: number) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <p>
                      {room.numRooms} x {room.roomType} - 
                      {room.adults} {room.adults === 1 ? 'Adult' : 'Adults'}
                      {room.childrenWithBed > 0 && `, ${room.childrenWithBed} ${room.childrenWithBed === 1 ? 'Child' : 'Children'} with bed`}
                      {room.childrenNoBed > 0 && `, ${room.childrenNoBed} ${room.childrenNoBed === 1 ? 'Child' : 'Children'} no bed`}
                      {room.infants > 0 && `, ${room.infants} ${room.infants === 1 ? 'Infant' : 'Infants'}`}
                    </p>
                  </div>
                ))}
              </div>
              
              {Array.isArray(booking.transfers) && booking.transfers.length > 0 && (
                <>
                  <Separator className="my-4" />
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Transfers</p>
                    {booking.transfers.map((transfer: any, index: number) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <p>
                          {transfer.from_location && transfer.to_location 
                            ? `${transfer.from_location} to ${transfer.to_location}`
                            : transfer.transfer_type || 'Airport Transfer'
                          }
                          {transfer.details && ` - ${transfer.details}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {Array.isArray(booking.activities) && booking.activities.length > 0 && (
                <>
                  <Separator className="my-4" />
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Activities & Experiences</p>
                    {booking.activities.map((activity: any, index: number) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <p>
                          {activity.title || activity.name || 'Activity'}
                          {activity.description && ` - ${activity.description}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Notes */}
          {(voucher.notes || booking.notes) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-lg">Special Instructions</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p>{voucher.notes || booking.notes}</p>
              </div>
            </div>
          )}
          
          {/* Emergency Contact */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-lg">Emergency Contact</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>For any inquiries or assistance, please contact your travel agent.</p>
              {/* Add agent contact details if available */}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-blue-50 border-t border-blue-100 flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Booking Reference</p>
            <p className="font-medium">{booking.booking_reference}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Voucher Reference</p>
            <p className="font-medium">{voucher.voucher_reference}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VoucherPreview;
