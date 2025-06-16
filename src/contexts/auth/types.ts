
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  org_id: string | null;
  created_at: string;
  trial_ends_at: string | null;
  currency: string | null;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export interface Organization {
  id: string;
  name: string;
  owner_id: string | null;
  created_at: string;
  logo_url: string | null;
  tagline: string | null;
  primary_color: string;
  secondary_color: string;
  subscription_tier: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface AuthError {
  message: string;
  status?: number;
}
