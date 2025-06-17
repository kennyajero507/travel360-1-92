
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Eye, ExternalLink } from 'lucide-react';
import { QuoteData } from '../../types/quote.types';
import { quotePreviewService } from '../../services/quotePreviewService';
import { toast } from 'sonner';

interface QuotePreviewButtonProps {
  quote: QuoteData;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

const QuotePreviewButton: React.FC<QuotePreviewButtonProps> = ({
  quote,
  variant = 'outline',
  size = 'sm'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePreview = async () => {
    if (!quote.id) {
      toast.error('Quote must be saved before preview');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('[QuotePreview] Generating preview for quote:', quote.id);
      
      // Generate the preview data
      const previewData = await quotePreviewService.generateClientPreview(quote.id);
      
      if (!previewData) {
        toast.error('Failed to generate quote preview');
        return;
      }

      // Store in session storage and open in new tab
      sessionStorage.setItem('previewQuote', JSON.stringify(previewData));
      const previewWindow = window.open('/quote-preview', '_blank');
      
      if (!previewWindow) {
        toast.error('Please allow pop-ups to view the quote preview');
        return;
      }

      console.log('[QuotePreview] Preview generated successfully');
      toast.success('Quote preview opened in new tab');
      
    } catch (error) {
      console.error('[QuotePreview] Error generating preview:', error);
      toast.error('Failed to generate quote preview');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePreview}
      disabled={isGenerating || !quote.id}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
          Generating...
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 mr-2" />
          Preview
          <ExternalLink className="h-3 w-3 ml-1" />
        </>
      )}
    </Button>
  );
};

export default QuotePreviewButton;
