
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useInvoiceData } from '../hooks/useInvoiceData';
import { CreateInvoiceData, InvoiceLineItem } from '../types/invoice.types';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { createInvoice, isCreating } = useInvoiceData();
  
  const [formData, setFormData] = useState<CreateInvoiceData>({
    client_name: '',
    client_email: '',
    amount: 0,
    currency_code: 'USD',
    due_date: '',
    notes: '',
    line_items: [{
      id: '1',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }]
  });

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newLineItems[index].total = newLineItems[index].quantity * newLineItems[index].unit_price;
    }
    
    const totalAmount = newLineItems.reduce((sum, item) => sum + item.total, 0);
    
    setFormData({
      ...formData,
      line_items: newLineItems,
      amount: totalAmount
    });
  };

  const addLineItem = () => {
    const newId = (formData.line_items.length + 1).toString();
    setFormData({
      ...formData,
      line_items: [...formData.line_items, {
        id: newId,
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }]
    });
  };

  const removeLineItem = (index: number) => {
    if (formData.line_items.length > 1) {
      const newLineItems = formData.line_items.filter((_, i) => i !== index);
      const totalAmount = newLineItems.reduce((sum, item) => sum + item.total, 0);
      
      setFormData({
        ...formData,
        line_items: newLineItems,
        amount: totalAmount
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const invoice = await createInvoice(formData);
    if (invoice) {
      navigate('/invoices');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-gray-600">Generate a new invoice for your client</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client_name">Client Name *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="client_email">Client Email</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Line Items
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.line_items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <Input
                      value={item.total.toFixed(2)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={formData.line_items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>${formData.amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency_code">Currency</Label>
                <Select value={formData.currency_code} onValueChange={(value) => setFormData({ ...formData, currency_code: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or terms..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
