
import { Button } from "../ui/button";
import { Loader2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuoteActionButtonsProps {
  saving: boolean;
  handleSave: () => void;
  onCancel?: () => void;
  returnUrl?: string;
}

const QuoteActionButtons = ({ 
  saving, 
  handleSave, 
  onCancel,
  returnUrl = "/quotes" 
}: QuoteActionButtonsProps) => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(returnUrl);
    }
  };
  
  return (
    <div className="flex justify-end space-x-4">
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
      <Button 
        onClick={handleSave} 
        disabled={saving}
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Changes
      </Button>
    </div>
  );
};

export default QuoteActionButtons;
