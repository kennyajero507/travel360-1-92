
import { supabase } from "../integrations/supabase/client";
import { errorHandler } from "./errorHandlingService";

export interface AuditLog {
  id: string;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string;
  user_id?: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id?: string;
  activity_type: string;
  description?: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

class AuditService {
  async logUserActivity(
    activityType: string,
    description?: string,
    metadata?: any
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get client info
      const userAgent = navigator.userAgent;
      
      const { error } = await supabase
        .from('user_activities')
        .insert([{
          user_id: user?.id,
          activity_type: activityType,
          description,
          metadata,
          user_agent: userAgent
        }]);

      if (error) {
        console.error('Failed to log user activity:', error);
      }
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }

  async getAuditLogs(
    tableNames?: string[],
    operations?: string[],
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

      if (operations?.length) {
        query = query.in('operation', operations);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.handleError(error, 'AuditService.getAuditLogs');
      return [];
    }
  }

  async getUserActivities(
    userId?: string,
    activityTypes?: string[],
    limit: number = 50
  ): Promise<UserActivity[]> {
    try {
      let query = supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (activityTypes?.length) {
        query = query.in('activity_type', activityTypes);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.handleError(error, 'AuditService.getUserActivities');
      return [];
    }
  }
}

export const auditService = new AuditService();
