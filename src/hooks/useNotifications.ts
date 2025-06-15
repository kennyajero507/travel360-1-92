
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

// This matches DB + app notifications model
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  user_id: string;
  related_id?: string;
  related_type?: 'quote' | 'booking' | 'inquiry' | 'invoice';
}

// type guard to ensure string is valid notification type
function isNotificationType(type: any): type is Notification['type'] {
  return ['info', 'success', 'warning', 'error'].includes(type);
}

// Helper to coerce raw notification data from Supabase to Notification type
function toNotification(n: any): Notification {
  return {
    ...n,
    type: isNotificationType(n.type) ? n.type : 'info',
  };
}

// Realtime user notifications (read/unread, create)
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch from Supabase live
  useEffect(() => {
    let subscriber: any;

    const fetchNotifications = async () => {
      setLoading(true);
      // Only for the logged-in user
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) {
        const converted = (data || []).map(toNotification);
        setNotifications(converted);
        setUnreadCount(converted.filter((n: any) => !n.read).length);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Subscribe to realtime changes
    subscriber = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      if (subscriber) supabase.removeChannel(subscriber);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const createNotification = async (
    notification: Omit<Notification, 'id' | 'created_at' | 'read'>
  ) => {
    // logged in user's id is set server-side via RLS
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...notification }])
      .select()
      .single();

    if (!error && data) {
      setNotifications((prev) => [toNotification(data), ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    }
    return !!data;
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    refetch: async () => {
      // Force reload from DB
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      const converted = (data || []).map(toNotification);
      setNotifications(converted);
      setUnreadCount(converted.filter((n: any) => !n.read).length);
    },
  };
};
