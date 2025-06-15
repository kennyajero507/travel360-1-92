
import React from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Eye, Trash2, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { QuoteData, QuoteStatus } from "../../types/quote.types";
import { format } from "date-fns";
import { toast } from "sonner";

interface QuoteTableProps {
  quotes: QuoteData[];
  onDelete: (quoteId: string) => Promise<void>;
}

const statusVariant: { [key in QuoteStatus]: "default" | "secondary" | "destructive" | "outline" } = {
    draft: "secondary",
    sent: "default",
    approved: "default",
    rejected: "destructive",
    expired: "outline",
};

export const QuoteTable = ({ quotes, onDelete }: QuoteTableProps) => {
  const navigate = useNavigate();

  const handleEdit = (quoteId: string) => {
    navigate(`/quotes/${quoteId}`);
  };

  const handleDelete = async (quoteId: string) => {
    try {
      await onDelete(quoteId);
    } catch (error) {
        // error is handled by the hook
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No quotes found.
              </TableCell>
            </TableRow>
          ) : (
            quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.client}</TableCell>
                <TableCell>{quote.destination}</TableCell>
                <TableCell>
                  {quote.start_date && quote.end_date ?
                    `${format(new Date(quote.start_date), "dd MMM yyyy")} - ${format(new Date(quote.end_date), "dd MMM yyyy")}`
                    : "N/A"
                  }
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={statusVariant[quote.status] || 'default'} 
                    className={`capitalize ${quote.status === 'approved' ? 'bg-green-100 text-green-800' : ''}`}
                  >
                    {quote.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(quote.id)}>
                        <Edit className="mr-2 h-4 w-4" /> View / Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(quote.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
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
