import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get('/notifications');
      const data = res.data?.data || [];
      const unread = data.filter((n: Notification) => !n.is_read).length;
      set({ notifications: data, unreadCount: unread, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch notifications', loading: false });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => {
      // Check if notification already exists to avoid duplicates
      if (state.notifications.some((n) => n.id === notification.id)) {
        return state;
      }
      const updated = [notification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: state.unreadCount + 1,
      };
    });
  },

  markAllAsRead: async () => {
    try {
      await apiClient.put('/notifications/mark-read');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        const unread = updated.filter((n) => !n.is_read).length;
        return {
          notifications: updated,
          unreadCount: unread,
        };
      });
    } catch (err: any) {
      console.error(`Failed to mark notification ${id} as read:`, err);
    }
  },
}));
