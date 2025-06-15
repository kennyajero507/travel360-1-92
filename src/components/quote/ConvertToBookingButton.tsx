
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useBookingCreation } from '../../hooks/useBookingCreation';
import { QuoteData } from '../../types/quote.types';
import { BookOpen, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ConvertToBookingButtonProps {
  quote: QuoteData;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export const ConvertToBookingButton: React.FC<ConvertToBookingButtonProps> = ({
  quote,
  variant = 'default',
  size = 'default'
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { convertQuoteToBooking, isConverting, checkEligibility } = useBookingCreation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    agentId: profile?.id || '',
    notes: ''
  });
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    reason?: string;
  } | null>(null);

  const handleOpenDialog = async () => {
    setIsOpen(true);
    if (!eligibilityChecked) {
      const result = await checkEligibility(quote.id);
      setEligibilityResult(result);
      setEligibilityChecked(true);
    }
  };

  const handleConvert = async () => {
    try {
      const result = await convertQuoteToBooking({
        quote,
        additionalData: formData
      });
      
      if (result.success && result.booking) {
        setIsOpen(false);
        navigate(`/bookings/${result.booking.id}`);
      }
    } catch (error) {
      console.error('Error converting quote to booking:', error);
    }
  };

  const isEligible = eligibilityResult?.eligible ?? true;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          onClick={handleOpenDialog}
          disabled={quote.status === 'converted'}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          {quote.status === 'converted' ? 'Already Converted' : 'Convert to Booking'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Quote to Booking</DialogTitle>
          <DialogDescription>
            Convert this quote into a confirmed booking for {quote.client}
          </DialogDescription>
        </DialogHeader>

        {!isEligible && eligibilityResult && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {eligibilityResult.reason}
            </AlertDescription>
          </Alert>
        )}

        {isEligible && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="agentId">Assigned Agent</Label>
              <Input
                id="agentId"
                value={formData.agentId}
                onChange={(e) => setFormData(prev => ({ ...prev, agentId: e.target.value }))}
                placeholder="Agent ID"
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes for the booking..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConvert} disabled={isConverting}>
                {isConverting ? 'Converting...' : 'Create Booking'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
