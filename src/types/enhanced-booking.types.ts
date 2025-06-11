
export interface Payment {
  id: string;
  booking_id: string;
  invoice_id?: string;
  amount: number;
  currency_code: string;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingAnalytics {
  id: string;
  booking_id: string;
  organization_id: string;
  revenue: number;
  profit_margin: number;
  booking_source?: string;
  conversion_days?: number;
  client_satisfaction_score?: number;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: 'booking_confirmation' | 'status_update' | 'payment_reminder' | 'voucher_delivery';
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  recipient_email: string;
  subject: string;
  content: string;
  notification_type: string;
  status: 'pending' | 'sent' | 'failed';
  booking_id?: string;
  sent_at?: string;
  created_at: string;
}

export interface VoucherTemplate {
  id: string;
  name: string;
  template_content: Record<string, any>;
  is_default: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface BookingFilters {
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  client?: string;
  hotel?: string;
  amountRange?: {
    min: number;
    max: number;
  };
  paymentStatus?: string[];
}

export interface BookingExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  fields: string[];
  filters?: BookingFilters;
}
