
import { Button } from "../ui/button";
import { Loader2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuoteActionButtonsProps {
  saving: boolean;
  handleSave: () => void;
  onCancel?: () => void;
  returnUrl?: string;
  primaryButtonText?: string;
  disablePrimary?: boolean;
  showSaveIcon?: boolean;
}

const QuoteActionButtons = ({ 
  saving, 
  handleSave, 
  onCancel,
  returnUrl = "/quotes",
  primaryButtonText = "Save Changes",
  disablePrimary = false,
  showSaveIcon = true
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
        disabled={saving || disablePrimary}
      >
        {saving ? 
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
          (showSaveIcon && <Save className="mr-2 h-4 w-4" />)
        }
        {primaryButtonText}
      </Button>
    </div>
  );
};

export default QuoteActionButtons;
