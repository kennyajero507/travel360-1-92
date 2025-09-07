import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Download, 
  Check, 
  X, 
  Star, 
  Clock, 
  Calendar,
  Users,
  MapPin,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { formatCurrency } from '../../utils/quoteCalculations';
import type { Quote, QuoteOption, QuoteInteraction } from '../../types/quote';
import { toast } from 'sonner';

const ClientQuotePortal: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [options, setOptions] = useState<QuoteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    if (token) {
      fetchQuoteData();
      logInteraction('viewed');
    }
  }, [token]);

  const fetchQuoteData = async () => {
    try {
      setLoading(true);
      
      // Fetch quote by portal token (public access)
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('client_portal_token', token)
        .single();

      if (quoteError) throw quoteError;
      if (!quoteData) throw new Error('Quote not found');

      setQuote(quoteData as Quote);
      setClientEmail(quoteData.client_email || '');

      // Fetch quote options
      const { data: optionsData, error: optionsError } = await supabase
        .from('quote_options')
        .select('*')
        .eq('quote_id', quoteData.id)
        .order('sort_order');

      if (optionsError) throw optionsError;
      setOptions(optionsData as QuoteOption[] || []);

      // Update quote view timestamp
      await supabase
        .from('quotes')
        .update({ client_viewed_at: new Date().toISOString() })
        .eq('id', quoteData.id);

    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Quote not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const logInteraction = async (type: QuoteInteraction['interaction_type'], data?: any) => {
    if (!quote) return;

    try {
      await supabase
        .from('quote_interactions')
        .insert({
          quote_id: quote.id,
          interaction_type: type,
          client_email: clientEmail,
          interaction_data: data || {},
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };

  const handleQuoteResponse = async (action: 'accepted' | 'rejected') => {
    if (!quote) return;

    try {
      setSubmitting(true);
      
      const updates = {
        status: action,
        client_selection_date: new Date().toISOString()
      };

      await supabase
        .from('quotes')
        .update(updates)
        .eq('id', quote.id);

      // Log interaction
      await logInteraction(action, { 
        feedback: feedback || null,
        selected_options: options.filter(o => o.is_selected).map(o => o.id)
      });

      setQuote(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success(
        action === 'accepted' 
          ? 'Quote accepted! We will contact you shortly.'
          : 'Thank you for your response. We appreciate your feedback.'
      );

    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOptionSelect = async (optionId: string) => {
    try {
      // Update local state
      setOptions(prev => prev.map(option => ({
        ...option,
        is_selected: option.id === optionId
      })));

      // Update database
      await supabase
        .from('quote_options')
        .update({ is_selected: false })
        .eq('quote_id', quote?.id);

      await supabase
        .from('quote_options')
        .update({ is_selected: true })
        .eq('id', optionId);

      toast.success('Option selected');
    } catch (error) {
      console.error('Error selecting option:', error);
      toast.error('Failed to select option');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await logInteraction('downloaded');
      toast.success('PDF download started');
      // Implement PDF download logic here
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) return;

    try {
      await logInteraction('feedback', { feedback });
      toast.success('Thank you for your feedback!');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
          <p className="text-gray-600">The quote you're looking for doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }

  const totalGuests = (quote.adults || 0) + (quote.children_with_bed || 0) + (quote.children_no_bed || 0) + (quote.infants || 0);
  const isExpired = quote.valid_until ? new Date(quote.valid_until) < new Date() : false;
  const canRespond = !isExpired && quote.status !== 'accepted' && quote.status !== 'rejected';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Travel Quote</h1>
              <p className="text-gray-600">Quote #{quote.quote_number}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`
                ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                ${quote.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${quote.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
              {isExpired && (
                <Badge className="bg-red-100 text-red-800">Expired</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Quote Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Trip Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Client:</span>
                  <span>{quote.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Destination:</span>
                  <span>{quote.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Travel Dates:</span>
                  <span>
                    {new Date(quote.start_date).toLocaleDateString()} - {new Date(quote.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Guests:</span>
                  <span>{totalGuests} guest{totalGuests !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Duration:</span>
                  <span>{quote.duration_nights} night{quote.duration_nights !== 1 ? 's' : ''}</span>
                </div>
                {quote.valid_until && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Valid Until:</span>
                    <span className={isExpired ? 'text-red-600' : ''}>
                      {new Date(quote.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Options */}
        {options.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Package Options</h2>
            {options.map((option) => (
              <Card 
                key={option.id} 
                className={`cursor-pointer transition-all ${
                  option.is_selected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
                } ${option.is_recommended ? 'border-amber-200 bg-amber-50' : ''}`}
                onClick={() => canRespond && handleOptionSelect(option.id!)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{option.option_name}</CardTitle>
                      {option.is_recommended && (
                        <Badge className="bg-amber-100 text-amber-800">
                          <Star className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                      {option.is_selected && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(option.total_price, option.currency_code)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {option.option_description && (
                    <p className="text-gray-600 mb-4">{option.option_description}</p>
                  )}
                  
                  {option.inclusions && option.inclusions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">What's Included:</h4>
                      <div className="flex flex-wrap gap-1">
                        {option.inclusions.map((inclusion, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {inclusion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Single Quote Option */
          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(quote.total_amount || 0, quote.currency_code || 'USD')}
                </div>
                <p className="text-gray-600">Total cost for your trip</p>
              </div>
              
              {quote.inclusions && quote.inclusions.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">What's Included:</h4>
                  <div className="flex flex-wrap gap-1">
                    {quote.inclusions.map((inclusion: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {inclusion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Terms & Conditions */}
        {quote.terms_conditions && (
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{quote.terms_conditions}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response Section */}
        {canRespond && (
          <Card>
            <CardHeader>
              <CardTitle>Your Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Feedback or Questions (Optional)
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share any feedback, questions, or special requests..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleQuoteResponse('accepted')}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept Quote
                </Button>
                <Button
                  onClick={() => handleQuoteResponse('rejected')}
                  disabled={submitting}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline Quote
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback Section for already responded quotes */}
        {!canRespond && quote.status === 'accepted' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Additional Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Any additional comments or questions about your trip..."
                rows={3}
              />
              <Button onClick={submitFeedback} disabled={!feedback.trim()}>
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {quote.client_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a href={`mailto:${quote.client_email}`} className="text-primary hover:underline">
                    {quote.client_email}
                  </a>
                </div>
              )}
              {quote.mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a href={`tel:${quote.mobile}`} className="text-primary hover:underline">
                    {quote.mobile}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientQuotePortal;