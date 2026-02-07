'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api-client';
import { GlassCard } from './GlassCard';
import { LoadingSpinner } from './LoadingSpinner';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  task_id?: number;
}

const NotificationCenter: React.FC = () => {
  const { isConnected, notifications, clearNotifications } = useWebSocket();
  const { isAuthenticated } = useAuth();
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  // Update notifications when real-time notifications arrive
  useEffect(() => {
    if (notifications.length > 0) {
      setAllNotifications(prev => [...notifications, ...prev]);
      setUnreadCount(prev => prev + notifications.length);
    }
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getNotifications({ limit: 50 });
      setAllNotifications(response.notifications || []);
      const unread = (response.notifications || []).filter((n: NotificationItem) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setAllNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setAllNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_CREATED':
      case 'TASK_COMPLETED':
      case 'TASK_UPDATED':
        return '📋';
      case 'LOGIN':
        return '🔓';
      case 'LOGOUT':
        return '🔒';
      case 'SIGNUP':
        return '🎉';
      case 'PROFILE_UPDATED':
        return '👤';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 7v5H9V7h6zM4 12h6v5H4v-5z" />
        </svg>

        {/* Connection Status Indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`} />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 max-h-96 z-50"
            >
              <GlassCard className="p-0 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-xs text-gray-400">
                        {isConnected ? 'Live' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <LoadingSpinner size="sm" />
                      <p className="text-gray-400 mt-2">Loading...</p>
                    </div>
                  ) : allNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <div className="text-3xl mb-2">🔔</div>
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {allNotifications.slice(0, 20).map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                            !notification.is_read ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => !notification.is_read && markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-xl">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-white truncate">
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-gray-400 ml-2">
                                  {formatTime(notification.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mt-1">
                                {notification.message}
                              </p>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {allNotifications.length > 20 && (
                  <div className="p-4 border-t border-white/10 text-center">
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      View all notifications
                    </button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;