
import { Button } from "../ui/button";
import { Loader2, Save, Download, Eye, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuoteHeaderProps {
  quoteId: string;
  client: string;
  createdAt?: string;
  saving: boolean;
  handleSave: () => void;
  previewQuote: () => void;
  emailQuote: () => void;
  downloadQuote: () => void;
  returnToList?: () => void;
  isHotelSelectionRequired?: boolean;
  disableSave?: boolean;
  stage?: 'hotel-selection' | 'quote-details';
  onStageChange?: (stage: 'hotel-selection' | 'quote-details') => void;
}

const QuoteHeader = ({ 
  quoteId, 
  client, 
  createdAt, 
  saving, 
  handleSave, 
  previewQuote, 
  emailQuote, 
  downloadQuote,
  returnToList,
  isHotelSelectionRequired = false,
  disableSave = false,
  stage = 'quote-details',
  onStageChange
}: QuoteHeaderProps) => {
  const navigate = useNavigate();
  
  const handleReturn = () => {
    if (returnToList) {
      returnToList();
    } else {
      navigate("/quotes");
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-teal-600">
          {stage === 'hotel-selection' ? 'Select Hotels' : `Edit Quote ${quoteId}`}
          <Button 
            variant="link" 
            className="text-sm text-teal-500" 
            onClick={handleReturn}
          >
            Return to Quotes
          </Button>
        </h1>
        <p className="text-gray-500 mt-2">
          {client} - {new Date(createdAt || "").toLocaleDateString()}
        </p>
        
        {/* Stage navigation */}
        {onStageChange && (
          <div className="flex mt-2 space-x-4">
            <Button 
              variant={stage === 'hotel-selection' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onStageChange('hotel-selection')}
            >
              1. Hotel Selection
            </Button>
            <Button 
              variant={stage === 'quote-details' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStageChange('quote-details')}
              disabled={isHotelSelectionRequired}
            >
              2. Quote Details
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleSave} disabled={saving || disableSave}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
        <Button variant="outline" onClick={previewQuote} disabled={isHotelSelectionRequired}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button variant="outline" onClick={emailQuote} disabled={isHotelSelectionRequired}>
          <Mail className="mr-2 h-4 w-4" />
          Email to Client
        </Button>
        <Button onClick={downloadQuote} disabled={isHotelSelectionRequired}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default QuoteHeader;
