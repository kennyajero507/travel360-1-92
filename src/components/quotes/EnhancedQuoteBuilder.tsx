import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Save, FileText, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/quoteCalculations';
import type { QuoteFormData } from '../../types/quote';

interface EnhancedQuoteBuilderProps {
  formData: QuoteFormData;
  onChange: (field: keyof QuoteFormData, value: any) => void;
  onSave: () => void;
  loading?: boolean;
  currencyCode?: string;
}

const EnhancedQuoteBuilder: React.FC<EnhancedQuoteBuilderProps> = ({
  formData,
  onChange,
  onSave,
  loading = false,
  currencyCode = 'USD'
}) => {
  const [inclusions, setInclusions] = useState<string[]>(formData.inclusions || []);
  const [exclusions, setExclusions] = useState<string[]>(formData.exclusions || []);
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const addInclusion = () => {
    if (newInclusion.trim()) {
      const updated = [...inclusions, newInclusion.trim()];
      setInclusions(updated);
      onChange('inclusions', updated);
      setNewInclusion('');
    }
  };

  const removeInclusion = (index: number) => {
    const updated = inclusions.filter((_, i) => i !== index);
    setInclusions(updated);
    onChange('inclusions', updated);
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      const updated = [...exclusions, newExclusion.trim()];
      setExclusions(updated);
      onChange('exclusions', updated);
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    const updated = exclusions.filter((_, i) => i !== index);
    setExclusions(updated);
    onChange('exclusions', updated);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency_code}
                    onValueChange={(value) => onChange('currency_code', value)}
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
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Valid Until
                  </Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => onChange('valid_until', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Markup Percentage (Internal Use)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.markup_percentage}
                  onChange={(e) => onChange('markup_percentage', parseFloat(e.target.value) || 0)}
                  placeholder="15.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is hidden from clients and used for internal profit calculations
                </p>
              </div>

              <div>
                <Label>Internal Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => onChange('notes', e.target.value)}
                  placeholder="Add internal notes about this quote..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inclusions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    placeholder="Add inclusion item..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInclusion();
                      }
                    }}
                  />
                  <Button onClick={addInclusion} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="text-sm">{inclusion}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInclusion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">What's Not Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    placeholder="Add exclusion item..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addExclusion();
                      }
                    }}
                  />
                  <Button onClick={addExclusion} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {exclusions.map((exclusion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="text-sm">{exclusion}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExclusion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.terms_conditions}
                  onChange={(e) => onChange('terms_conditions', e.target.value)}
                  placeholder="Enter terms and conditions..."
                  rows={8}
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.payment_terms}
                    onChange={(e) => onChange('payment_terms', e.target.value)}
                    placeholder="e.g., 50% deposit required, balance due 30 days before travel..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.cancellation_policy}
                    onChange={(e) => onChange('cancellation_policy', e.target.value)}
                    placeholder="Enter cancellation policy details..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Client Response Deadline</Label>
                <Input
                  type="date"
                  value={formData.client_response_deadline}
                  onChange={(e) => onChange('client_response_deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional deadline for client to respond to this quote
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={loading} size="lg">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Quote
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedQuoteBuilder;