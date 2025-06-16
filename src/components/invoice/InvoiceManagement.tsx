
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, FileText, Send, Download } from 'lucide-react';
import { useInvoiceData } from '../../hooks/useInvoiceData';
import InvoiceTable from './InvoiceTable';
import CreateInvoiceDialog from './CreateInvoiceDialog';
import MobileResponsiveWrapper from '../mobile/MobileResponsiveWrapper';

const InvoiceManagement = () => {
  const { invoices, isLoading, createInvoice, updateInvoice } = useInvoiceData();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      await createInvoice(invoiceData);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await updateInvoice(invoiceId, { status: 'sent' });
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement PDF generation
    console.log('Download invoice:', invoiceId);
  };

  return (
    <MobileResponsiveWrapper>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Invoice Management</h1>
            <p className="text-gray-600">Create and manage customer invoices</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices.filter(inv => inv.status === 'draft').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${invoices.reduce((sum, inv) => sum + Number(inv.amount), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <InvoiceTable 
          invoices={invoices}
          isLoading={isLoading}
          onSendInvoice={handleSendInvoice}
          onDownloadInvoice={handleDownloadInvoice}
        />

        <CreateInvoiceDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateInvoice={handleCreateInvoice}
        />
      </div>
    </MobileResponsiveWrapper>
  );
};

export default InvoiceManagement;
