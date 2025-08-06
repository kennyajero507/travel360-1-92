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
import { calculateTotals, calculateDuration } from '../../utils/quoteCalculations';
import QuoteSummary from '../../components/quotes/QuoteSummary';

const CreateQuotePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inquiryId = searchParams.get('inquiry');
  
  const { createQuote } = useQuotes();
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
      if (!inquiry) {
        throw new Error('No inquiry data available');
      }

      // Calculate totals
      const { days, nights } = calculateDuration(inquiry.check_in_date, inquiry.check_out_date);
      const totals = calculateTotals(
        sleepingArrangements,
        transportOptions,
        transferOptions,
        activities,
        formData.markup_percentage,
        nights
      );

      const quoteData = {
        inquiry_id: inquiryId,
        client: inquiry.client_name,
        client_email: inquiry.client_email,
        mobile: inquiry.client_mobile,
        destination: inquiry.destination,
        start_date: inquiry.check_in_date,
        end_date: inquiry.check_out_date,
        duration_days: days,
        duration_nights: nights,
        adults: inquiry.adults || 1,
        children_with_bed: inquiry.children_with_bed || 0,
        children_no_bed: inquiry.children_no_bed || 0,
        infants: inquiry.infants || 0,
        hotel_id: formData.selected_hotel_id || null,
        sleeping_arrangements: sleepingArrangements,
        transport_options: transportOptions,
        transfer_options: transferOptions,
        activities: activities,
        subtotal: totals.subtotal,
        markup_percentage: formData.markup_percentage,
        markup_amount: totals.markupAmount,
        total_amount: totals.grandTotal,
        currency_code: formData.currency_code,
        valid_until: formData.valid_until,
        notes: formData.notes,
        status: 'draft' as const
      };

      await createQuote(quoteData);
      navigate('/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
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

  if (!inquiry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Inquiry not found</p>
        <Button className="mt-4" asChild>
          <Link to="/inquiries">Back to Inquiries</Link>
        </Button>
      </div>
    );
  }

  const { days, nights } = calculateDuration(inquiry.check_in_date, inquiry.check_out_date);

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
              sleepingArrangements={sleepingArrangements}
              transportOptions={transportOptions}
              transferOptions={transferOptions}
              activities={activities}
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