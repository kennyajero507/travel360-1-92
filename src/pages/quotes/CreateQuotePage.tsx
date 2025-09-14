import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuotes } from '../../hooks/useQuotes';
import { useQuoteForm } from '../../hooks/useQuoteForm';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { calculateTotals, calculateDuration } from '../../utils/quoteCalculations';
import QuoteSummary from '../../components/quotes/QuoteSummary';
import { toast } from 'sonner';
import EnhancedQuoteBuilder from '../../components/quotes/EnhancedQuoteBuilder';
import { MultiOptionQuoteBuilder } from '../../components/quotes/MultiOptionQuoteBuilder';
import { HotelSelectionBuilder } from '../../components/quotes/HotelSelectionBuilder';
import { TransportBuilder } from '../../components/quotes/TransportBuilder';
import { ActivityBuilder } from '../../components/quotes/ActivityBuilder';
import { TransferBuilder } from '../../components/quotes/TransferBuilder';

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
  const [savedQuoteId, setSavedQuoteId] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const duration = inquiry ? calculateDuration(inquiry.check_in_date, inquiry.check_out_date) : { days: 1, nights: 1 };
      
      const totals = calculateTotals(
        sleepingArrangements || [],
        transportOptions || [],
        transferOptions || [],
        activities || [],
        formData.markup_percentage,
        duration.nights
      );

      const quoteData = {
        ...formData,
        sleeping_arrangements: sleepingArrangements || [],
        transport_options: transportOptions || [],
        transfer_options: transferOptions || [],
        activities: activities || [],
        subtotal: totals.subtotal,
        markup_amount: totals.markupAmount,
        total_amount: totals.grandTotal,
        duration_days: duration.days,
        duration_nights: duration.nights,
        inquiry_id: inquiryId,
        client: inquiry?.client_name || 'Direct Entry',
        destination: inquiry?.destination || 'TBD',
        start_date: inquiry?.check_in_date || new Date().toISOString().split('T')[0],
        end_date: inquiry?.check_out_date || new Date().toISOString().split('T')[0],
        adults: inquiry?.adults || 1,
        status: 'draft'
      };

      const result = await createQuote(quoteData);
      if (result) {
        setSavedQuoteId(result.id);
        toast.success("Quote created successfully!");
      }
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

  const duration = inquiry ? calculateDuration(inquiry.check_in_date, inquiry.check_out_date) : { days: 1, nights: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/quotes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Quote</h1>
          <p className="text-gray-600 mt-1">
            {inquiry ? `Generate quote for inquiry ${inquiry.enquiry_number}` : 'Create new quote'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hotels" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="hotels">Hotels</TabsTrigger>
                  <TabsTrigger value="transport">Transport</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="transfers">Transfers</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="hotels">
                  <HotelSelectionBuilder
                    sleepingArrangements={sleepingArrangements || []}
                    onSleepingArrangementsChange={(arrangements) => 
                      handleFormDataChange('sleeping_arrangements', arrangements)
                    }
                    currencyCode={formData.currency_code || 'USD'}
                    duration={duration.nights}
                  />
                </TabsContent>

                <TabsContent value="transport">
                  <TransportBuilder
                    transportOptions={transportOptions || []}
                    onTransportOptionsChange={(options) => 
                      handleFormDataChange('transport_options', options)
                    }
                    currencyCode={formData.currency_code || 'USD'}
                    numPassengers={inquiry?.adults || 1}
                  />
                </TabsContent>

                <TabsContent value="activities">
                  <ActivityBuilder
                    activities={activities || []}
                    onActivitiesChange={(activities) => 
                      handleFormDataChange('activities', activities)
                    }
                    currencyCode={formData.currency_code || 'USD'}
                    defaultParticipants={inquiry?.adults || 1}
                  />
                </TabsContent>

                <TabsContent value="transfers">
                  <TransferBuilder
                    transferOptions={transferOptions || []}
                    onTransferOptionsChange={(options) => 
                      handleFormDataChange('transfer_options', options)
                    }
                    currencyCode={formData.currency_code || 'USD'}
                    numPassengers={inquiry?.adults || 1}
                  />
                </TabsContent>

                <TabsContent value="settings">
                  <EnhancedQuoteBuilder
                    formData={formData}
                    onChange={handleFormDataChange}
                    onSave={handleSubmit}
                    loading={loading}
                    currencyCode={formData.currency_code || 'USD'}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {savedQuoteId && (
            <Card>
              <CardHeader>
                <CardTitle>Quote Options</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiOptionQuoteBuilder
                  quoteId={savedQuoteId}
                  currencyCode={formData.currency_code || 'USD'}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteSummary
                sleepingArrangements={sleepingArrangements || []}
                transportOptions={transportOptions || []}
                transferOptions={transferOptions || []}
                activities={activities || []}
                markupPercentage={formData.markup_percentage}
                duration={duration.nights}
                currencyCode={formData.currency_code || 'USD'}
              />
              
              <div className="mt-6 space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? "Creating Quote..." : savedQuoteId ? "Update Quote" : "Create Quote"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/quotes')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotePage;