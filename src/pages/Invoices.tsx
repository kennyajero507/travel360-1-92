
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useInvoiceData } from '../hooks/useInvoiceData';
import { Invoice } from '../types/invoice.types';
import { Plus, Search, Eye, Edit, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const navigate = useNavigate();
  const { invoices, isLoading, deleteInvoice } = useInvoiceData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(id);
    }
  };

  if (isLoading) return <div>Loading invoices...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600">Manage your billing and payments</p>
        </div>
        <Button onClick={() => navigate('/invoices/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by client name or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-600">Client: {invoice.client_name}</p>
                  {invoice.client_email && (
                    <p className="text-sm text-gray-500">Email: {invoice.client_email}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Amount: ${invoice.amount.toFixed(2)} {invoice.currency_code}</span>
                    {invoice.due_date && (
                      <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                    )}
                    <span>Created: {new Date(invoice.created_at!).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/edit/${invoice.id}`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(invoice.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No invoices found</p>
            <Button 
              onClick={() => navigate('/invoices/create')} 
              className="mt-4"
            >
              Create your first invoice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Invoices;
