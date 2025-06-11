
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
      
      // Store in localStorage as fallback since we need to create the table first
      const activity = {
        user_id: user?.id,
        activity_type: activityType,
        description,
        metadata,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      };

      // Store in localStorage until backend tables are ready
      const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
      activities.push(activity);
      localStorage.setItem('user_activities', JSON.stringify(activities.slice(-100))); // Keep last 100

      console.log('[AuditService] User activity logged:', activity);
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
      // Return mock data until backend is ready
      const mockLogs: AuditLog[] = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      return mockLogs.slice(0, limit);
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
      // Return from localStorage until backend is ready
      const activities: UserActivity[] = JSON.parse(localStorage.getItem('user_activities') || '[]');
      
      let filteredActivities = activities;
      
      if (userId) {
        filteredActivities = filteredActivities.filter(a => a.user_id === userId);
      }
      
      if (activityTypes?.length) {
        filteredActivities = filteredActivities.filter(a => 
          activityTypes.includes(a.activity_type)
        );
      }
      
      return filteredActivities.slice(0, limit);
    } catch (error) {
      errorHandler.handleError(error, 'AuditService.getUserActivities');
      return [];
    }
  }
}

export const auditService = new AuditService();
