
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { ErrorHandler } from '../utils/errorHandler';

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  related_type?: string;
  related_id?: string;
  created_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  related_type?: string;
  related_id?: string;
}

export const notificationService = {
  async createNotification(notificationData: CreateNotificationData): Promise<NotificationData | null> {
    try {
      console.log('[NotificationService] Creating notification:', notificationData);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'Creating notification');
        return null;
      }

      return {
        ...data,
        type: data.type as NotificationData['type']
      };
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'createNotification');
      return null;
    }
  },

  async getUserNotifications(userId: string, limit: number = 50): Promise<NotificationData[]> {
    try {
      console.log('[NotificationService] Fetching notifications for user:', userId);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'Fetching notifications');
        return [];
      }

      return (data || []).map(notification => ({
        ...notification,
        type: notification.type as NotificationData['type']
      }));
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'getUserNotifications');
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      console.log('[NotificationService] Marking notification as read:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'Marking notification as read');
        return false;
      }

      return true;
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'markAsRead');
      return false;
    }
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      console.log('[NotificationService] Marking all notifications as read for user:', userId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'Marking all notifications as read');
        return false;
      }

      return true;
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'markAllAsRead');
      return false;
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'Getting unread count');
        return 0;
      }

      return count || 0;
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'getUnreadCount');
      return 0;
    }
  },

  // Utility functions for common notification types
  async notifyBookingStatusChange(userId: string, bookingId: string, status: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Booking Status Updated',
      message: `Booking status changed to ${status}`,
      type: 'info',
      related_type: 'booking',
      related_id: bookingId
    });
  },

  async notifyPaymentReceived(userId: string, bookingId: string, amount: number, currency: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Payment Received',
      message: `Payment of ${currency} ${amount} received`,
      type: 'success',
      related_type: 'payment',
      related_id: bookingId
    });
  },

  async notifyQuoteStatusChange(userId: string, quoteId: string, status: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Quote Status Updated',
      message: `Quote status changed to ${status}`,
      type: 'info',
      related_type: 'quote',
      related_id: quoteId
    });
  },

  async notifyInquiryAssigned(userId: string, inquiryId: string, agentName: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      title: 'Inquiry Assigned',
      message: `Inquiry assigned to ${agentName}`,
      type: 'info',
      related_type: 'inquiry',
      related_id: inquiryId
    });
  }
};
