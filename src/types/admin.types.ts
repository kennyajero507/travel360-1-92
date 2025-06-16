
export interface Organization {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'inactive';
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';
  subscription_start_date?: string;
  subscription_end_date?: string;
  billing_cycle: 'monthly' | 'yearly';
  created_at: string;
  owner_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  logo_url?: string;
  tagline?: string;
  primary_color?: string;
  secondary_color?: string;
  subscription_tier?: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface SystemEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  message?: string;
  metadata?: any;
  user_id?: string;
  created_at: string;
}

export interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  timestamp: string;
  metadata?: any;
}

export interface RolePermission {
  id: string;
  role: string;
  permission: string;
  resource?: string;
  action: string;
  created_at: string;
}

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';
export type BillingCycle = 'monthly' | 'yearly';
export type OrganizationStatus = 'active' | 'suspended' | 'inactive';
