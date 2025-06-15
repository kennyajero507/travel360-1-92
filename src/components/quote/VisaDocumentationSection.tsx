
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Trash2, Plus, FileText } from 'lucide-react';
import { VisaDocumentation } from '../../types/quote.types';

interface VisaDocumentationSectionProps {
  visaDocumentation: VisaDocumentation[];
  onVisaDocumentationChange: (documentation: VisaDocumentation[]) => void;
  tourType: 'domestic' | 'international';
}

const VisaDocumentationSection: React.FC<VisaDocumentationSectionProps> = ({
  visaDocumentation,
  onVisaDocumentationChange,
  tourType
}) => {
  // Only show for international tours
  if (tourType !== 'international') {
    return null;
  }

  const addDocumentationItem = () => {
    const newItem: VisaDocumentation = {
      id: `visa-${Date.now()}`,
      document_type: 'visa',
      required: true,
      description: '',
      cost: 0,
      processing_time_days: 7
    };
    onVisaDocumentationChange([...visaDocumentation, newItem]);
  };

  const updateDocumentationItem = (index: number, field: keyof VisaDocumentation, value: any) => {
    const updated = [...visaDocumentation];
    updated[index] = { ...updated[index], [field]: value };
    onVisaDocumentationChange(updated);
  };

  const removeDocumentationItem = (index: number) => {
    const updated = visaDocumentation.filter((_, i) => i !== index);
    onVisaDocumentationChange(updated);
  };

  const totalVisaCost = visaDocumentation.reduce((sum, item) => sum + (item.cost || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Visa & Documentation
          </CardTitle>
          <div className="text-sm text-gray-600">
            Total: ${totalVisaCost.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {visaDocumentation.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No visa or documentation requirements added yet.</p>
            <Button onClick={addDocumentationItem} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Documentation Requirement
            </Button>
          </div>
        ) : (
          <>
            {visaDocumentation.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Document Type</Label>
                    <Select
                      value={item.document_type}
                      onValueChange={(value) => updateDocumentationItem(index, 'document_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="travel_insurance">Travel Insurance</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Cost ($)</Label>
                    <Input
                      type="number"
                      value={item.cost}
                      onChange={(e) => updateDocumentationItem(index, 'cost', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Processing Time (Days)</Label>
                    <Input
                      type="number"
                      value={item.processing_time_days || ''}
                      onChange={(e) => updateDocumentationItem(index, 'processing_time_days', parseInt(e.target.value) || undefined)}
                      placeholder="7"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateDocumentationItem(index, 'description', e.target.value)}
                      placeholder="Describe the documentation requirement..."
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.required}
                        onCheckedChange={(checked) => updateDocumentationItem(index, 'required', checked)}
                      />
                      <Label>Required</Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDocumentationItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Button onClick={addDocumentationItem} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Documentation Requirement
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VisaDocumentationSection;
