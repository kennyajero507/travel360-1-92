
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import NormalizedAccommodationSection from './NormalizedAccommodationSection';
import NormalizedTransportSection from './NormalizedTransportSection';
import NormalizedTransferSection from './NormalizedTransferSection';
import NormalizedExcursionSection from './NormalizedExcursionSection';
import MarkupManagementSection from './MarkupManagementSection';
import QuoteSummarySection from './QuoteSummarySection';
import { Building, Car, Plane, MapPin, Calculator, DollarSign } from 'lucide-react';

interface NormalizedQuoteBuilderProps {
  quoteId: string;
  userRole?: string;
}

const NormalizedQuoteBuilder: React.FC<NormalizedQuoteBuilderProps> = ({ 
  quoteId, 
  userRole = 'agent' 
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quote Builder - Normalized Architecture</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">Quote ID: {quoteId}</Badge>
              <Badge variant={userRole === 'agent' ? 'default' : 'secondary'}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} View
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Quote Builder Tabs */}
      <Tabs defaultValue="accommodation" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="accommodation" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Accommodation
          </TabsTrigger>
          <TabsTrigger value="transport" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Transport
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Transfer
          </TabsTrigger>
          <TabsTrigger value="excursion" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Excursions
          </TabsTrigger>
          <TabsTrigger value="markup" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Markup
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accommodation" className="mt-6">
          <NormalizedAccommodationSection quoteId={quoteId} />
        </TabsContent>

        <TabsContent value="transport" className="mt-6">
          <NormalizedTransportSection quoteId={quoteId} />
        </TabsContent>

        <TabsContent value="transfer" className="mt-6">
          <NormalizedTransferSection quoteId={quoteId} />
        </TabsContent>

        <TabsContent value="excursion" className="mt-6">
          <NormalizedExcursionSection quoteId={quoteId} />
        </TabsContent>

        <TabsContent value="markup" className="mt-6">
          <MarkupManagementSection quoteId={quoteId} />
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <QuoteSummarySection quoteId={quoteId} userRole={userRole} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NormalizedQuoteBuilder;
