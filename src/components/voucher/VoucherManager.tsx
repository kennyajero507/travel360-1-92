import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Plus, Eye, Mail, Download } from "lucide-react";
import { toast } from "sonner";
import { Booking, TravelVoucher } from "../../types/booking.types";
import { createVoucher, getVouchersByBookingId, sendVoucherByEmail } from "../../services/voucherService";
import { generateVoucherPDF } from "../../services/pdfVoucherGenerator";

interface VoucherManagerProps {
  booking: Booking;
}

const VoucherManager = ({ booking }: VoucherManagerProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ["vouchers", booking.id],
    queryFn: () => getVouchersByBookingId(booking.id),
  });

  const createVoucherMutation = useMutation({
    mutationFn: createVoucher,
    onSuccess: (newVoucher) => {
      toast.success(`Voucher ${newVoucher.voucher_reference} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["vouchers", booking.id] });
      navigate(`/vouchers/${newVoucher.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create voucher.");
      console.error(error);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ voucher, booking }: { voucher: TravelVoucher; booking: Booking }) =>
      sendVoucherByEmail({ voucher, booking }),
    onSuccess: () => {
      // Toast is now handled in the service for better consistency
      queryClient.invalidateQueries({ queryKey: ["vouchers", booking.id] });
    },
    onError: (err: any) => {
      // Error toast is handled in the service
      console.error(err);
    },
  });

  const handleCreateVoucher = () => {
    toast.info("Generating voucher...");
    createVoucherMutation.mutate(booking);
  };
  
  const handleSendEmail = (voucher: TravelVoucher) => {
    toast.info("Sending voucher email...");
    sendEmailMutation.mutate({ voucher, booking });
  }

  const handleDownloadVoucher = (voucher: TravelVoucher) => {
    generateVoucherPDF(voucher, booking);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            Travel Vouchers
          </CardTitle>
          {vouchers && vouchers.length === 0 && (
            <Button 
              size="sm"
              onClick={handleCreateVoucher}
              disabled={createVoucherMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {createVoucherMutation.isPending ? "Generating..." : "Generate Voucher"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading vouchers...</p>
        ) : !vouchers || vouchers.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p>No vouchers found for this booking.</p>
            <p className="text-sm">Click "Generate Voucher" to create one.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher Ref</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Email Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>{voucher.voucher_reference}</TableCell>
                  <TableCell>{new Date(voucher.issued_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {voucher.email_sent ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Sent</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Not Sent</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="Download" onClick={() => handleDownloadVoucher(voucher)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="View Details" onClick={() => navigate(`/vouchers/${voucher.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!voucher.email_sent && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Send Email" 
                        onClick={() => handleSendEmail(voucher)}
                        disabled={sendEmailMutation.isPending && sendEmailMutation.variables?.voucher.id === voucher.id}
                      >
                        <Mail className="h-4 w-4" />
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
  );
};

export default VoucherManager;
