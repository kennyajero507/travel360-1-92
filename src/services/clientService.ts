
import { supabase } from '../integrations/supabase/client';
import { Client, NewClient } from '../types/client.types';

export const clientService = {
  async getAllClients(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createClient(newClient: NewClient): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.org_id) throw new Error("User organization not found");
    
    const clientToInsert = {
      ...newClient,
      org_id: profile.org_id,
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('clients')
      .insert(clientToInsert)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, updates: Partial<NewClient>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  }
};
