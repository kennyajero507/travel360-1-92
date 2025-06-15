
import React from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Eye, UserPlus, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { InquiryData } from "../../types/inquiry.types";
import { InquiryStatusBadge } from "./InquiryStatusBadge";
import { format } from "date-fns";

interface InquiryTableProps {
  filteredInquiries: InquiryData[];
  openAssignDialog: (inquiryId: string) => void;
  permissions: {
    inquiries: {
      can_assign: boolean;
    };
  };
  role: string;
  currentUser: any;
}

export const InquiryTable = ({ 
  filteredInquiries, 
  openAssignDialog, 
  permissions, 
  role, 
  currentUser 
}: InquiryTableProps) => {
  const navigate = useNavigate();

  const handleCreateQuote = (inquiryId: string) => {
    navigate(`/quotes/create?inquiryId=${inquiryId}`);
  };

  const formatTravelerCount = (inquiry: InquiryData) => {
    const parts = [];
    if (inquiry.adults > 0) parts.push(`${inquiry.adults} Adult${inquiry.adults > 1 ? 's' : ''}`);
    if (inquiry.children > 0) parts.push(`${inquiry.children} Child${inquiry.children > 1 ? 'ren' : ''}`);
    if (inquiry.infants > 0) parts.push(`${inquiry.infants} Infant${inquiry.infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inquiry #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Travel Dates</TableHead>
            <TableHead>Travelers</TableHead>
            <TableHead>Status</TableHead>
            {role !== 'agent' && <TableHead>Assigned To</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInquiries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={role !== 'agent' ? 8 : 7} className="h-24 text-center">
                No inquiries found.
              </TableCell>
            </TableRow>
          ) : (
            filteredInquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium">{inquiry.enquiry_number}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{inquiry.client_name}</div>
                    <div className="text-sm text-gray-500">{inquiry.client_mobile}</div>
                  </div>
                </TableCell>
                <TableCell>{inquiry.destination}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{format(new Date(inquiry.check_in_date), 'dd MMM yyyy')}</div>
                    <div className="text-gray-500">to {format(new Date(inquiry.check_out_date), 'dd MMM yyyy')}</div>
                    <div className="text-xs text-gray-400">
                      {inquiry.nights_count || 0} nights
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatTravelerCount(inquiry)}
                  </div>
                </TableCell>
                <TableCell>
                  <InquiryStatusBadge status={inquiry.status} />
                </TableCell>
                {role !== 'agent' && (
                  <TableCell>
                    {inquiry.assigned_agent_name ? (
                      <Badge variant="outline">{inquiry.assigned_agent_name}</Badge>
                    ) : (
                      <span className="text-gray-500 text-sm">Unassigned</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/inquiries/${inquiry.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateQuote(inquiry.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Create Quote
                      </DropdownMenuItem>
                      {permissions.inquiries.can_assign && (
                        <DropdownMenuItem onClick={() => openAssignDialog(inquiry.id)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign Agent
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
