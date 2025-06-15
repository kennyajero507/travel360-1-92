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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Travel Vouchers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-500 text-center">
          The voucher feature is not available. Please contact support to enable this feature.
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherManager;
