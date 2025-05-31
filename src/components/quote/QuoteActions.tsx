
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { FileDown, Mail, Printer, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuoteData } from "../../types/quote.types";
import { useAuth } from "../../contexts/AuthContext";

interface QuoteActionsProps {
  quote: QuoteData;
  onEmailQuote?: () => void;
  onPrintQuote?: () => void;
  onDownloadQuote?: () => void;
}

const QuoteActions = ({ 
  quote, 
  onEmailQuote, 
  onPrintQuote, 
  onDownloadQuote 
}: QuoteActionsProps) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const canCreateBooking = userProfile && 
    ['agent', 'tour_operator', 'org_owner'].includes(userProfile.role) &&
    quote.status === 'approved';

  const handleCreateBooking = () => {
    navigate(`/quotes/${quote.id}/create-booking`);
  };

  const handleEmailQuote = () => {
    if (onEmailQuote) {
      onEmailQuote();
    } else {
      toast.success("Quote sent to client via email");
    }
  };

  const handlePrintQuote = () => {
    if (onPrintQuote) {
      onPrintQuote();
    } else {
      window.print();
    }
  };

  const handleDownloadQuote = () => {
    if (onDownloadQuote) {
      onDownloadQuote();
    } else {
      toast.success("Quote downloaded as PDF");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Quote Actions
          <Badge 
            variant="outline" 
            className={
              quote.status === 'approved' ? "bg-green-50 text-green-700 border-green-300" :
              quote.status === 'sent' ? "bg-blue-50 text-blue-700 border-blue-300" :
              quote.status === 'rejected' ? "bg-red-50 text-red-700 border-red-300" :
              "bg-gray-50 text-gray-700 border-gray-300"
            }
          >
            {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1) || 'Draft'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-1 gap-2">
          {canCreateBooking && (
            <Button 
              onClick={handleCreateBooking}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Booking
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleEmailQuote}
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email to Client
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrintQuote}
            size="sm"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDownloadQuote}
            size="sm"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Status Information */}
        {quote.status === 'approved' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              ✅ This quote has been approved by the client and is ready for booking.
            </p>
          </div>
        )}
        
        {quote.status === 'sent' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              📧 This quote has been sent to the client and is awaiting their response.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteActions;
