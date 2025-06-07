
export interface Invoice {
  id: string;
  invoice_number: string;
  booking_id?: string;
  quote_id?: string;
  organization_id: string;
  client_name: string;
  client_email?: string;
  amount: number;
  currency_code: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  paid_date?: string;
  payment_method?: string;
  notes?: string;
  line_items: InvoiceLineItem[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface CreateInvoiceData {
  booking_id?: string;
  quote_id?: string;
  client_name: string;
  client_email?: string;
  amount: number;
  currency_code: string;
  due_date?: string;
  notes?: string;
  line_items: InvoiceLineItem[];
}
