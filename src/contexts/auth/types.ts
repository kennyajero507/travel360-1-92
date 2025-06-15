
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  org_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  phone: string | null;
  currency: string | null;
  email_notifications: boolean;
  sms_notifications: boolean;
}
