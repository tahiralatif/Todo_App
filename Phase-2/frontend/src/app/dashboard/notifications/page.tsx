'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import api from '@/lib/api';
import type { Notification } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    // Mark all as read when page opens
    markAllAsReadOnOpen();
  }, []);

  const markAllAsReadOnOpen = async () => {
    try {
      // Wait a bit for user to see notifications
      setTimeout(async () => {
        const hasUnread = notifications.some(n => !n.is_read);
        if (hasUnread) {
          await api.markAllNotificationsRead();
          loadNotifications();
          loadUnreadCount();
          // Notify sidebar to update badge
          window.dispatchEvent(new Event('notificationsUpdated'));
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications({ limit: 50 });
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data: any = await api.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      showToast('Notification marked as read', 'success');
      loadNotifications();
      loadUnreadCount();
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      showToast('Failed to mark as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      showToast('All notifications marked as read', 'success');
      loadNotifications();
      loadUnreadCount();
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteNotification(id);
      showToast('Notification deleted', 'success');
      loadNotifications();
      loadUnreadCount();
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      showToast('Failed to delete notification', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all"
          >
            <CheckCheck className="w-5 h-5" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/80 rounded-2xl border border-slate-700/50">
          <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border transition-all ${
                notification.is_read
                  ? 'bg-slate-900/50 border-slate-700/50'
                  : 'bg-teal-500/10 border-teal-500/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.is_read ? 'bg-slate-800' : 'bg-teal-500/20'
                }`}>
                  <Bell className={`w-5 h-5 ${notification.is_read ? 'text-slate-400' : 'text-teal-400'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1">{notification.title}</h4>
                  <p className="text-sm text-slate-400 mb-2">{notification.message}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-teal-400 hover:bg-teal-500/20 rounded-lg transition-all"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
