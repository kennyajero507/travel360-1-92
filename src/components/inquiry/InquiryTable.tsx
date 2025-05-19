
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
            <TableHead>ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Travelers</TableHead>
            <TableHead>Rooms</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
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
              <TableCell colSpan={12} className="text-center py-10">
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
