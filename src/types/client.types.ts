
export interface Client {
  id: string;
  org_id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type NewClient = Omit<Client, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'created_by'>;
