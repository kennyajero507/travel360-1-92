import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { quoteMarkupService } from '../../services/normalizedQuoteService';
import { Percent, Save } from 'lucide-react';
import { toast } from 'sonner';

interface MarkupManagementSectionProps {
  quoteId: string;
}

const MarkupManagementSection: React.FC<MarkupManagementSectionProps> = ({ quoteId }) => {
  const queryClient = useQueryClient();
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [notes, setNotes] = useState('');

  const { data: markup, isLoading } = useQuery({
    queryKey: ['quote-markup', quoteId],
    queryFn: () => quoteMarkupService.getByQuoteId(quoteId),
    enabled: !!quoteId
  });
  // guard for unavailable data or fallback any
  let markupPercentageValue = 0;
  let notesValue = '';
  if (markup && typeof markup === 'object' && 'markup_percentage' in markup) {
    markupPercentageValue = (markup as any).markup_percentage ?? 0;
    notesValue = (markup as any).notes ?? '';
  }

  const saveMutation = useMutation({
    mutationFn: (data: any) => quoteMarkupService.createOrUpdate(quoteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-markup', quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quote-summary', quoteId] });
      toast.success('Markup settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save markup settings');
    }
  });

  useEffect(() => {
    setMarkupPercentage(markupPercentageValue);
    setNotes(notesValue);
    // eslint-disable-next-line
  }, [markup]);

  const handleSave = () => {
    saveMutation.mutate({
      markup_percentage: markupPercentage,
      notes: notes
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-green-600" />
          💰 Quote Markup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="markup-percentage">Markup Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                id="markup-percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
                placeholder="Enter markup percentage"
              />
              <span className="text-gray-500">%</span>
            </div>
          </div>

          <div className="flex items-end">
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Markup'}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="markup-notes">Markup Notes</Label>
          <Textarea
            id="markup-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the markup calculation..."
            rows={3}
          />
        </div>

        {markupPercentage > 0 && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              A {markupPercentage}% markup will be applied to the total cost of this quote.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarkupManagementSection;
