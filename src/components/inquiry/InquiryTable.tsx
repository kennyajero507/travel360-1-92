
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { InquiryRow } from "./InquiryRow";

interface InquiryTableProps {
  filteredInquiries: any[];
  openAssignDialog: (inquiryId: string) => void;
  permissions: any;
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
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Enquiry #</TableHead>
            <TableHead>Tour Type</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Travel Dates</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Travelers</TableHead>
            <TableHead>Rooms</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Lead Source</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry) => (
              <InquiryRow 
                key={inquiry.id}
                inquiry={inquiry}
                openAssignDialog={openAssignDialog}
                permissions={permissions}
                role={role}
                currentUser={currentUser}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={15} className="text-center py-10">
                {role === 'agent' ? 
                  "No inquiries assigned to you yet." : 
                  "No inquiries found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
