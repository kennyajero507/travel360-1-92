import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuotes } from '../../hooks/useQuotes';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { formatCurrency } from '../../utils/quoteCalculations';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import QuoteSummary from '../../components/quotes/QuoteSummary';

const EditQuotePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useSimpleAuth();
  const { updateQuote } = useQuotes();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [orgSettings, setOrgSettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    markup_percentage: 15,
    valid_until: '',
    currency_code: 'KES',
    notes: ''
  });

  const fetchQuote = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Quote not found');
        navigate('/quotes');
        return;
      }

      setQuote(data);
      setFormData({
        markup_percentage: data.markup_percentage || 15,
        valid_until: data.valid_until || '',
        currency_code: data.currency_code || 'KES',
        notes: data.notes || ''
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Failed to load quote');
    }
  };

  const fetchOrganizationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('org_id', profile?.org_id)
        .maybeSingle();

      if (error) throw error;
      setOrgSettings(data);
    } catch (error) {
      console.error('Error fetching organization settings:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchQuote(), fetchOrganizationSettings()]);
      setLoading(false);
    };

    if (id && profile?.org_id) {
      loadData();
    }
  }, [id, profile?.org_id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!quote) return;

      const updates = {
        markup_percentage: formData.markup_percentage,
        valid_until: formData.valid_until,
        currency_code: formData.currency_code,
        notes: formData.notes,
        updated_at: new Date().toISOString()
      };

      await updateQuote(quote.id, updates);
      toast.success('Quote updated successfully!');
      navigate('/quotes');
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrencyDisplay = (amount: number) => {
    return formatCurrency(amount, formData.currency_code);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Quote not found</p>
        <Button className="mt-4" asChild>
          <Link to="/quotes">Back to Quotes</Link>
        </Button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
          <p className="text-gray-600 mt-1">Update quote {quote.quote_number}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quote Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Quote Number</Label>
                    <p className="text-base font-semibold text-gray-900">{quote.quote_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Client</Label>
                    <p className="text-base font-semibold text-gray-900">{quote.client}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Destination</Label>
                    <p className="text-base text-gray-900">{quote.destination}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Travel Dates</Label>
                    <p className="text-base text-gray-900">
                      {new Date(quote.start_date).toLocaleDateString()} - {new Date(quote.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Duration</Label>
                    <p className="text-base text-gray-900">{quote.duration_days} days, {quote.duration_nights} nights</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Guests</Label>
                    <p className="text-base text-gray-900">
                      {quote.adults} adults
                      {quote.children_with_bed > 0 && `, ${quote.children_with_bed} children with bed`}
                      {quote.children_no_bed > 0 && `, ${quote.children_no_bed} children no bed`}
                      {quote.infants > 0 && `, ${quote.infants} infants`}
                    </p>
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
                      onChange={(e) => handleInputChange('markup_percentage', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => handleInputChange('valid_until', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={formData.currency_code}
                      onValueChange={(value) => handleInputChange('currency_code', value)}
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
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any special notes or terms..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <QuoteSummary
              sleepingArrangements={quote.sleeping_arrangements || []}
              transportOptions={quote.transport_options || []}
              transferOptions={quote.transfer_options || []}
              activities={quote.activities || []}
              markupPercentage={formData.markup_percentage}
              durationNights={quote.duration_nights || 1}
              currencyCode={formData.currency_code}
            />

            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/quotes')}
                  disabled={saving}
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

export default EditQuotePage;