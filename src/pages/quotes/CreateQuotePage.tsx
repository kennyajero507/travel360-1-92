import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuotes } from '../../hooks/useQuotes';
import { useQuoteForm } from '../../hooks/useQuoteForm';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { calculateTotals, calculateDuration } from '../../utils/quoteCalculations';
import QuoteSummary from '../../components/quotes/QuoteSummary';
import { toast } from 'sonner';
import MultiOptionQuoteBuilder from '../../components/quotes/MultiOptionQuoteBuilder';

const CreateQuotePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inquiryId = searchParams.get('inquiry');
  
  const { createQuote } = useQuotes();
  const { profile } = useSimpleAuth();
  const {
    inquiry,
    loadingInquiry,
    formData,
    sleepingArrangements,
    transportOptions,
    transferOptions,
    activities,
    handleFormDataChange
  } = useQuoteForm(inquiryId || undefined);

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('=== QUOTE CREATION DEBUG ===');
      console.log('inquiryId from URL:', inquiryId);
      console.log('inquiry data:', inquiry);
      console.log('profile:', profile);
      console.log('formData:', formData);

      // Ensure arrays are safe before any operations
      const safeSleepingArrangements = Array.isArray(sleepingArrangements) ? sleepingArrangements : [];
      const safeTransportOptions = Array.isArray(transportOptions) ? transportOptions : [];
      const safeTransferOptions = Array.isArray(transferOptions) ? transferOptions : [];
      const safeActivities = Array.isArray(activities) ? activities : [];

      if (!inquiry && inquiryId) {
        console.error('No inquiry data available');
        toast.error('No inquiry data available. Please select an inquiry first.');
        return;
      }

      // If no inquiry is provided, use form data directly
      if (!inquiry) {
        console.log('Creating quote without inquiry (direct entry)');
        const defaultQuoteData = {
          client: 'Direct Entry Client',
          client_email: '',
          mobile: '',
          destination: 'To be determined',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          duration_days: 1,
          duration_nights: 1,
          adults: 1,
          children_with_bed: 0,
          children_no_bed: 0,
          infants: 0,
          hotel_id: formData.selected_hotel_id || null,
          sleeping_arrangements: safeSleepingArrangements,
          transport_options: safeTransportOptions,
          transfer_options: safeTransferOptions,
          activities: safeActivities,
          subtotal: 0,
          markup_percentage: formData.markup_percentage,
          markup_amount: 0,
          total_amount: 0,
          currency_code: formData.currency_code,
          valid_until: formData.valid_until || null,
          notes: formData.notes || null,
          status: 'draft' as const
        };

        await createQuote(defaultQuoteData);
        navigate('/quotes');
        return;
      }

      console.log('Creating quote from inquiry:', inquiry);

      // Calculate totals
      const { days, nights } = calculateDuration(inquiry.check_in_date, inquiry.check_out_date);
      
      const totals = calculateTotals(
        safeSleepingArrangements,
        safeTransportOptions,
        safeTransferOptions,
        safeActivities,
        formData.markup_percentage,
        nights
      );

      // Handle data structure inconsistencies between inquiries
      const adults = inquiry.adults || inquiry.num_adults || 1;
      const childrenWithBed = inquiry.children_with_bed || 0;
      const childrenNoBed = inquiry.children_no_bed || 0;
      const infants = inquiry.infants || 0;

      console.log('Inquiry data being used:', {
        inquiry_id: inquiryId,
        client_name: inquiry.client_name,
        adults,
        children_with_bed: childrenWithBed,
        children_no_bed: childrenNoBed,
        infants,
        check_in_date: inquiry.check_in_date,
        check_out_date: inquiry.check_out_date,
        destination: inquiry.destination
      });

      const quoteData = {
        inquiry_id: inquiryId,
        client: inquiry.client_name,
        client_email: inquiry.client_email || null,
        mobile: inquiry.client_mobile || '',
        destination: inquiry.destination,
        start_date: inquiry.check_in_date,
        end_date: inquiry.check_out_date,
        duration_days: days,
        duration_nights: nights,
        adults: adults,
        children_with_bed: childrenWithBed,
        children_no_bed: childrenNoBed,
        infants: infants,
        hotel_id: formData.selected_hotel_id || null,
        sleeping_arrangements: safeSleepingArrangements,
        transport_options: safeTransportOptions,
        transfer_options: safeTransferOptions,
        activities: safeActivities,
        subtotal: totals.subtotal,
        markup_percentage: formData.markup_percentage,
        markup_amount: totals.markupAmount,
        total_amount: totals.grandTotal,
        currency_code: formData.currency_code,
        valid_until: formData.valid_until || null,
        notes: formData.notes || null,
        status: 'draft' as const
      };

      console.log('Quote data to create:', quoteData);

      await createQuote(quoteData);
      navigate('/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error(`Failed to create quote: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingInquiry) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!inquiry && inquiryId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Inquiry not found</p>
        <div className="mt-4 space-x-4">
          <Button asChild>
            <Link to="/inquiries">Back to Inquiries</Link>
          </Button>
          <Button variant="outline" onClick={() => navigate('/quotes/create')}>
            Create Quote Manually
          </Button>
        </div>
      </div>
    );
  }

  if (!inquiry && !inquiryId) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/quotes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotes
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Quote</h1>
            <p className="text-gray-600 mt-1">Create a new quote manually</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Quote Creation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Markup Percentage</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.markup_percentage}
                    onChange={(e) => handleFormDataChange('markup_percentage', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => handleFormDataChange('valid_until', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={formData.currency_code}
                  onValueChange={(value) => handleFormDataChange('currency_code', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleFormDataChange('notes', e.target.value)}
                  placeholder="Add any special notes..."
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Quote...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Quote
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }

  const { days, nights } = calculateDuration(inquiry.check_in_date, inquiry.check_out_date);

  // Ensure arrays are safe for rendering
  const safeSleepingArrangements = Array.isArray(sleepingArrangements) ? sleepingArrangements : [];
  const safeTransportOptions = Array.isArray(transportOptions) ? transportOptions : [];
  const safeTransferOptions = Array.isArray(transferOptions) ? transferOptions : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/quotes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Quote</h1>
          <p className="text-gray-600 mt-1">Generate a detailed quote for inquiry {inquiry.enquiry_number}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Multi-Option Quote Builder */}
            <MultiOptionQuoteBuilder quoteId="" currencyCode={formData.currency_code} />
            
            {/* Inquiry Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Inquiry Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Client</Label>
                    <p className="text-base font-semibold text-gray-900">{inquiry.client_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Destination</Label>
                    <p className="text-base text-gray-900">{inquiry.destination}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Travel Dates</Label>
                    <p className="text-base text-gray-900">
                      {new Date(inquiry.check_in_date).toLocaleDateString()} - {new Date(inquiry.check_out_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Duration</Label>
                    <p className="text-base text-gray-900">{days} days, {nights} nights</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Guests</Label>
                    <p className="text-base text-gray-900">
                      {inquiry.adults} adults
                      {inquiry.children_with_bed > 0 && `, ${inquiry.children_with_bed} children with bed`}
                      {inquiry.children_no_bed > 0 && `, ${inquiry.children_no_bed} children no bed`}
                      {inquiry.infants > 0 && `, ${inquiry.infants} infants`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Mobile</Label>
                    <p className="text-base text-gray-900">{inquiry.client_mobile}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Markup Percentage (Hidden from client)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.markup_percentage}
                      onChange={(e) => handleFormDataChange('markup_percentage', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => handleFormDataChange('valid_until', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={formData.currency_code}
                      onValueChange={(value) => handleFormDataChange('currency_code', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                        <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleFormDataChange('notes', e.target.value)}
                    placeholder="Add any special notes or terms..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <QuoteSummary
              sleepingArrangements={safeSleepingArrangements}
              transportOptions={safeTransportOptions}
              transferOptions={safeTransferOptions}
              activities={safeActivities}
              markupPercentage={formData.markup_percentage}
              durationNights={nights}
              currencyCode={formData.currency_code}
            />

            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Quote...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Quote
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/quotes')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateQuotePage;