import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, FileText, Calculator, Hotel, Plane, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';

const EditQuotePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useSimpleAuth();
  
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  const [formData, setFormData] = useState({
    markup_percentage: 15,
    valid_until: '',
    notes: '',
    currency_code: 'USD'
  });

  const [orgSettings, setOrgSettings] = useState<any>(null);

  // Fetch quote data and organization settings
  useEffect(() => {
    if (id && profile?.org_id) {
      fetchQuote();
      fetchOrganizationSettings();
    }
  }, [id, profile?.org_id]);

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

  const fetchQuote = async () => {
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
      
      // Set form data from quote
      setFormData({
        markup_percentage: data.markup_percentage || 15,
        valid_until: data.valid_until || '',
        notes: data.notes || '',
        currency_code: data.currency_code || 'USD'
      });
      
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Failed to load quote data');
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          markup_percentage: formData.markup_percentage,
          valid_until: formData.valid_until,
          notes: formData.notes,
          currency_code: formData.currency_code,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Quote updated successfully!');
      navigate('/quotes');
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = formData.currency_code || 'USD';
    const symbol = {
      'USD': '$',
      'KES': 'KSh',
      'EUR': '€',
      'GBP': '£',
      'TZS': 'TSh',
      'UGX': 'USh'
    }[currency] || '$';
    
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loadingQuote) {
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
          <p className="text-gray-600 mt-1">Editing quote {quote.quote_number}</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Quote Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(quote.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Markup ({formData.markup_percentage}%)</span>
                    <span className="font-medium text-blue-600">{formatCurrency((quote.subtotal || 0) * formData.markup_percentage / 100)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">{formatCurrency((quote.subtotal || 0) * (1 + formData.markup_percentage / 100))}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      Updating Quote...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Quote
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

export default EditQuotePage;