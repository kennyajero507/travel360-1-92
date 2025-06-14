
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  org_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
}
