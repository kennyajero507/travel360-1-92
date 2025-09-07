import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Plus, Trash2, Star, Edit3, Check, X } from 'lucide-react';
import { useQuoteOptions } from '../../hooks/useQuoteOptions';
import { formatCurrency } from '../../utils/quoteCalculations';
import type { QuoteOption } from '../../types/quote';
import { toast } from 'sonner';

interface MultiOptionQuoteBuilderProps {
  quoteId: string;
  currencyCode: string;
  onOptionsUpdated?: () => void;
}

const MultiOptionQuoteBuilder: React.FC<MultiOptionQuoteBuilderProps> = ({
  quoteId,
  currencyCode,
  onOptionsUpdated
}) => {
  const { options, loading, createOption, updateOption, deleteOption } = useQuoteOptions(quoteId);
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [newOption, setNewOption] = useState<Partial<QuoteOption>>({
    option_name: '',
    option_description: '',
    base_price: 0,
    total_price: 0,
    currency_code: currencyCode,
    inclusions: [],
    exclusions: [],
    hotel_details: {},
    transport_details: {},
    activity_details: {},
    is_recommended: false,
    is_selected: false,
    sort_order: options.length + 1
  });

  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleCreateOption = async () => {
    if (!newOption.option_name || !newOption.total_price) {
      toast.error('Please provide option name and price');
      return;
    }

    try {
      await createOption(newOption as Omit<QuoteOption, 'id'>);
      setNewOption({
        option_name: '',
        option_description: '',
        base_price: 0,
        total_price: 0,
        currency_code: currencyCode,
        inclusions: [],
        exclusions: [],
        hotel_details: {},
        transport_details: {},
        activity_details: {},
        is_recommended: false,
        is_selected: false,
        sort_order: options.length + 2
      });
      setIsAddingNew(false);
      onOptionsUpdated?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateOption = async (id: string, updates: Partial<QuoteOption>) => {
    try {
      await updateOption(id, updates);
      setEditingOption(null);
      onOptionsUpdated?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this option?')) {
      try {
        await deleteOption(id);
        onOptionsUpdated?.();
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const addInclusionToNewOption = (inclusion: string) => {
    if (inclusion.trim()) {
      setNewOption(prev => ({
        ...prev,
        inclusions: [...(prev.inclusions || []), inclusion.trim()]
      }));
    }
  };

  const removeInclusionFromNewOption = (index: number) => {
    setNewOption(prev => ({
      ...prev,
      inclusions: prev.inclusions?.filter((_, i) => i !== index) || []
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quote Options</h3>
        <Button
          onClick={() => setIsAddingNew(true)}
          disabled={isAddingNew}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>

      {/* Existing Options */}
      <div className="grid gap-4">
        {options.map((option) => (
          <Card key={option.id} className={`border-2 ${option.is_recommended ? 'border-amber-200 bg-amber-50' : 'border-gray-200'}`}>
            <CardHeader className="pb-3">
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingOption(option.id!)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteOption(option.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {option.option_description && (
                <p className="text-sm text-gray-600">{option.option_description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(option.total_price, option.currency_code)}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={option.is_recommended}
                      onCheckedChange={(checked) =>
                        handleUpdateOption(option.id!, { is_recommended: checked })
                      }
                    />
                    <Label className="text-sm">Recommended</Label>
                  </div>
                </div>
              </div>

              {option.inclusions && option.inclusions.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Inclusions:</h4>
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

      {/* Add New Option Form */}
      {isAddingNew && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg">Add New Option</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Option Name *</Label>
                <Input
                  value={newOption.option_name}
                  onChange={(e) => setNewOption(prev => ({ ...prev, option_name: e.target.value }))}
                  placeholder="e.g., Standard Package"
                />
              </div>
              <div>
                <Label>Total Price * ({currencyCode})</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newOption.total_price}
                  onChange={(e) => setNewOption(prev => ({ ...prev, total_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newOption.option_description}
                onChange={(e) => setNewOption(prev => ({ ...prev, option_description: e.target.value }))}
                placeholder="Describe what's included in this option..."
                rows={3}
              />
            </div>

            <div>
              <Label>Inclusions</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add inclusion (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        addInclusionToNewOption(input.value);
                        input.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {newOption.inclusions?.map((inclusion, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {inclusion}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeInclusionFromNewOption(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newOption.is_recommended}
                  onCheckedChange={(checked) => setNewOption(prev => ({ ...prev, is_recommended: checked }))}
                />
                <Label className="text-sm">Mark as recommended</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateOption} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewOption({
                    option_name: '',
                    option_description: '',
                    base_price: 0,
                    total_price: 0,
                    currency_code: currencyCode,
                    inclusions: [],
                    exclusions: [],
                    hotel_details: {},
                    transport_details: {},
                    activity_details: {},
                    is_recommended: false,
                    is_selected: false,
                    sort_order: options.length + 1
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiOptionQuoteBuilder;
