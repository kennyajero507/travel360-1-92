
import { Button } from "../ui/button";
import { Loader2, Save, Download, Eye, Mail } from "lucide-react";

interface QuoteHeaderProps {
  quoteId: string;
  client: string;
  createdAt?: string;
  saving: boolean;
  handleSave: () => void;
  previewQuote: () => void;
  emailQuote: () => void;
  downloadQuote: () => void;
}

const QuoteHeader = ({ 
  quoteId, 
  client, 
  createdAt, 
  saving, 
  handleSave, 
  previewQuote, 
  emailQuote, 
  downloadQuote 
}: QuoteHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">Edit Quote {quoteId}</h1>
        <p className="text-gray-500 mt-2">
          {client} - {new Date(createdAt || "").toLocaleDateString()}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
        <Button variant="outline" onClick={previewQuote}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button variant="outline" onClick={emailQuote}>
          <Mail className="mr-2 h-4 w-4" />
          Email to Client
        </Button>
        <Button onClick={downloadQuote} className="bg-blue-600 hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default QuoteHeader;
