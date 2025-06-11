
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { supabase } from "../../integrations/supabase/client";
import { TravelVoucher } from "../../types/booking.types";
import { FileText, Mail, Download, Plus, Eye } from "lucide-react";
import { toast } from "sonner";

interface VoucherManagerProps {
  bookingId?: string;
}

const VoucherManager = ({ bookingId }: VoucherManagerProps) => {
  const [vouchers, setVouchers] = useState<TravelVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    notes: '',
    issued_by: ''
  });

  useEffect(() => {
    loadVouchers();
  }, [bookingId]);

  const loadVouchers = async () => {
    try {
      let query = supabase
        .from('travel_vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setVouchers(data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const createVoucher = async () => {
    if (!bookingId) {
      toast.error('Booking ID is required to create a voucher');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('travel_vouchers')
        .insert([{
          booking_id: bookingId,
          issued_by: newVoucher.issued_by,
          notes: newVoucher.notes
        }])
        .select()
        .single();

      if (error) throw error;
      
      setVouchers(prev => [data, ...prev]);
      setShowCreateDialog(false);
      setNewVoucher({ notes: '', issued_by: '' });
      toast.success('Voucher created successfully');
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error('Failed to create voucher');
    }
  };

  const sendVoucherEmail = async (voucherId: string) => {
    try {
      const { error } = await supabase
        .from('travel_vouchers')
        .update({ email_sent: true })
        .eq('id', voucherId);

      if (error) throw error;
      
      setVouchers(prev => prev.map(v => 
        v.id === voucherId ? { ...v, email_sent: true } : v
      ));
      
      toast.success('Voucher email sent successfully');
    } catch (error) {
      console.error('Error sending voucher email:', error);
      toast.error('Failed to send voucher email');
    }
  };

  const generatePDF = (voucher: TravelVoucher) => {
    // Placeholder for PDF generation
    toast.info('PDF generation feature coming soon');
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Travel Vouchers
          </div>
          {bookingId && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Voucher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Travel Voucher</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="issued_by">Issued By</Label>
                    <Input
                      id="issued_by"
                      value={newVoucher.issued_by}
                      onChange={(e) => setNewVoucher(prev => ({ ...prev, issued_by: e.target.value }))}
                      placeholder="Enter issuer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newVoucher.notes}
                      onChange={(e) => setNewVoucher(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Enter any additional notes"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createVoucher}>
                      Create Voucher
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vouchers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No vouchers found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Issued By</TableHead>
                <TableHead>Email Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">
                    {voucher.voucher_reference}
                  </TableCell>
                  <TableCell>
                    {new Date(voucher.issued_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{voucher.issued_by || 'System'}</TableCell>
                  <TableCell>
                    <Badge variant={voucher.email_sent ? "default" : "outline"}>
                      {voucher.email_sent ? 'Sent' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePDF(voucher)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      {!voucher.email_sent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendVoucherEmail(voucher.id)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Send Email
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info('Voucher preview coming soon')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default VoucherManager;
