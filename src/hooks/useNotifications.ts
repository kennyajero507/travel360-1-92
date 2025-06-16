
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, NotificationData } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSync } from './useRealtimeSync';
import { useEffect } from 'react';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  // Real-time sync for notifications
  useRealtimeSync({
    table: 'notifications',
    filterColumn: 'user_id',
    filterValue: userId,
    queryKeysInvalidate: ['notifications', 'unread-count'],
    queryClient,
  });

  const {
    data: notifications = [],
    isLoading
  } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => userId ? notificationService.getUserNotifications(userId) : [],
    enabled: !!userId
  });

  const {
    data: unreadCount = 0
  } = useQuery({
    queryKey: ['unread-count', userId],
    queryFn: () => userId ? notificationService.getUnreadCount(userId) : 0,
    enabled: !!userId,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['unread-count', userId] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => userId ? notificationService.markAllAsRead(userId) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['unread-count', userId] });
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending
  };
};
