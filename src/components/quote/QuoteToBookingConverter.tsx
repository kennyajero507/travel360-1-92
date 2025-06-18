
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import CurrencyDisplay from './CurrencyDisplay';

interface QuoteData {
  id: string;
  client: string;
  mobile: string;
  client_email?: string;
  destination: string;
  start_date: string;
  end_date: string;
  adults: number;
  children_with_bed?: number;
  children_no_bed?: number;
  infants?: number;
  currency_code: string;
  room_arrangements?: any[];
  transports?: any[];
  transfers?: any[];
  activities?: any[];
  status: string;
}

interface QuoteToBookingConverterProps {
  quote: QuoteData;
  onConvert: (bookingData: any) => Promise<void>;
  isConverting?: boolean;
}

const QuoteToBookingConverter: React.FC<QuoteToBookingConverterProps> = ({
  quote,
  onConvert,
  isConverting = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    booking_reference: `BK-${Date.now()}`,
    agent_notes: '',
    payment_method: '',
    deposit_amount: 0,
    balance_due_date: '',
    special_instructions: ''
  });

  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    issues: string[];
  }>({ eligible: true, issues: [] });

  const handleOpenDialog = () => {
    setIsOpen(true);
    checkEligibility();
  };

  const checkEligibility = () => {
    const issues: string[] = [];
    
    // Check if quote has required data
    if (!quote.client || !quote.mobile) {
      issues.push('Missing client contact information');
    }
    
    if (!quote.start_date || !quote.end_date) {
      issues.push('Missing travel dates');
    }
    
    if (!quote.room_arrangements || quote.room_arrangements.length === 0) {
      issues.push('No accommodation arrangements specified');
    }
    
    if (quote.status === 'converted') {
      issues.push('Quote has already been converted to booking');
    }

    setEligibilityResult({
      eligible: issues.length === 0,
      issues
    });
    setEligibilityChecked(true);
  };

  const handleConvert = async () => {
    if (!eligibilityResult.eligible) return;

    const bookingData = {
      quote_id: quote.id,
      booking_reference: formData.booking_reference,
      client: quote.client,
      client_email: quote.client_email,
      mobile: quote.mobile,
      destination: quote.destination,
      travel_start: quote.start_date,
      travel_end: quote.end_date,
      adults: quote.adults,
      children_with_bed: quote.children_with_bed || 0,
      children_no_bed: quote.children_no_bed || 0,
      infants: quote.infants || 0,
      currency_code: quote.currency_code,
      room_arrangement: quote.room_arrangements,
      transport: quote.transports,
      transfers: quote.transfers,
      activities: quote.activities,
      status: 'confirmed',
      notes: formData.agent_notes,
      payment_method: formData.payment_method,
      deposit_amount: formData.deposit_amount,
      balance_due_date: formData.balance_due_date,
      special_instructions: formData.special_instructions
    };

    try {
      await onConvert(bookingData);
      setIsOpen(false);
    } catch (error) {
      console.error('Error converting quote to booking:', error);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    quote.room_arrangements?.forEach(room => total += room.total || 0);
    quote.transports?.forEach(transport => total += transport.total_cost || 0);
    quote.transfers?.forEach(transfer => total += transfer.total || 0);
    quote.activities?.forEach(activity => total += activity.total_cost || 0);
    return total;
  };

  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'Credit Card',
    'Mobile Money',
    'Cheque'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleOpenDialog}
          disabled={quote.status === 'converted'}
          className="w-full"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          {quote.status === 'converted' ? 'Already Converted' : 'Convert to Booking'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Quote to Booking</DialogTitle>
          <DialogDescription>
            Convert this quote into a confirmed booking for {quote.client}
          </DialogDescription>
        </DialogHeader>

        {/* Quote Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Quote Summary</span>
            <Badge variant="outline">{quote.destination}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Client:</strong> {quote.client}</p>
              <p><strong>Mobile:</strong> {quote.mobile}</p>
              <p><strong>Email:</strong> {quote.client_email || 'Not provided'}</p>
            </div>
            <div>
              <p><strong>Travel Dates:</strong> {quote.start_date} to {quote.end_date}</p>
              <p><strong>Guests:</strong> {quote.adults} adults, {(quote.children_with_bed || 0) + (quote.children_no_bed || 0)} children</p>
              <p><strong>Total:</strong> <CurrencyDisplay amount={calculateTotal()} currencyCode={quote.currency_code} /></p>
            </div>
          </div>
        </div>

        {/* Eligibility Check */}
        {eligibilityChecked && (
          <div className="space-y-3">
            {eligibilityResult.eligible ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Quote is ready to be converted to booking.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <p className="font-medium mb-2">Cannot convert quote due to:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {eligibilityResult.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Booking Details Form */}
        {eligibilityResult.eligible && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="booking_reference">Booking Reference</Label>
                <Input
                  id="booking_reference"
                  value={formData.booking_reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, booking_reference: e.target.value }))}
                  placeholder="BK-12345"
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deposit_amount">Deposit Amount</Label>
                <Input
                  id="deposit_amount"
                  type="number"
                  value={formData.deposit_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="balance_due_date">Balance Due Date</Label>
                <Input
                  id="balance_due_date"
                  type="date"
                  value={formData.balance_due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, balance_due_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="agent_notes">Agent Notes</Label>
              <Textarea
                id="agent_notes"
                value={formData.agent_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, agent_notes: e.target.value }))}
                placeholder="Any additional notes for the booking..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                value={formData.special_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                placeholder="Special instructions for the service providers..."
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
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

export default QuoteToBookingConverter;
