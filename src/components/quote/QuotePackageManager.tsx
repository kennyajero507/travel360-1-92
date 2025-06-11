
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Package, Plus, Check, AlertCircle } from 'lucide-react';
import { QuoteData } from '../../types/quote.types';
import { unifiedQuoteService } from '../../services/unifiedQuoteService';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../ui/alert';

interface QuotePackageManagerProps {
  quotes: QuoteData[];
  onPackageCreated: (packageId: string) => void;
}

const QuotePackageManager: React.FC<QuotePackageManagerProps> = ({
  quotes,
  onPackageCreated
}) => {
  const [packageName, setPackageName] = useState('');
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleQuoteToggle = (quoteId: string) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const handleCreatePackage = async () => {
    if (!packageName.trim()) {
      toast.error('Please enter a package name');
      return;
    }

    if (selectedQuotes.length === 0) {
      toast.error('Please select at least one quote');
      return;
    }

    setIsCreating(true);
    try {
      const selectedQuoteData = quotes.filter(q => selectedQuotes.includes(q.id));
      const packageId = await unifiedQuoteService.createQuotePackage(
        selectedQuoteData, 
        packageName
      );
      
      onPackageCreated(packageId);
      
      // Reset form
      setPackageName('');
      setSelectedQuotes([]);
    } catch (error) {
      console.error('Error creating package:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getTotalCost = (quote: QuoteData) => {
    if (quote.summary_data && typeof quote.summary_data === 'object') {
      return (quote.summary_data as any).total_cost || 0;
    }
    return 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Create Quote Package for Client Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a temporary implementation. Full quote package functionality will be available after database schema updates.
          </AlertDescription>
        </Alert>

        <div>
          <label className="block text-sm font-medium mb-2">Package Name</label>
          <Input
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="e.g., Luxury Maldives Options"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Select Quotes ({selectedQuotes.length} selected)
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {quotes.map(quote => (
              <div
                key={quote.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedQuotes.includes(quote.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleQuoteToggle(quote.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{quote.client}</div>
                    <div className="text-sm text-gray-600">
                      {quote.destination} • {quote.duration_nights} nights
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{quote.status}</Badge>
                      {getTotalCost(quote) > 0 && (
                        <Badge variant="secondary">
                          ${getTotalCost(quote).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedQuotes.includes(quote.id) && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleCreatePackage}
          disabled={isCreating || selectedQuotes.length === 0 || !packageName.trim()}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? 'Creating Package...' : 'Create Quote Package'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuotePackageManager;
