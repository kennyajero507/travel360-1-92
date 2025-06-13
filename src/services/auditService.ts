
import { supabase } from "../integrations/supabase/client";

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

class AuditService {
  async logAction(
    action: string,
    tableName: string,
    recordId?: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get client info
      const userAgent = navigator.userAgent;
      
      const auditLog = {
        user_id: user?.id,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData,
        new_data: newData,
        user_agent: userAgent,
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert([auditLog]);

      if (error) {
        console.error('Error logging audit action:', error);
      }
    } catch (error) {
      console.error('Error in audit service:', error);
    }
  }

  async getAuditLogs(
    tableNames?: string[],
    actions?: string[],
    limit: number = 50
  ): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (tableNames?.length) {
        query = query.in('table_name', tableNames);
      }

      if (actions?.length) {
        query = query.in('action', actions);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAuditLogs:', error);
      return [];
    }
  }

  async getUserActivities(userId?: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserActivities:', error);
      return [];
    }
  }
}

export const auditService = new AuditService();
