'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      id,
      ...notificationData,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (notificationData.duration !== 0) {
      const duration = notificationData.duration || 5000; // Default 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationPanel />
    </NotificationContext.Provider>
  );
};

const NotificationPanel: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  // Get the latest 5 notifications
  const recentNotifications = notifications.slice(-5);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-sm">
      <AnimatePresence>
        {recentNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="ml-auto"
          >
            <NotificationItem
              notification={notification}
              onDismiss={() => removeNotification(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-500/10',
          icon: (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'error':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          icon: (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          icon: (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case 'info':
      default:
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          icon: (
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  const { border, bg, icon } = getTypeStyles();

  return (
    <GlassCard className={`p-4 ${bg} ${border} backdrop-blur-md max-w-sm w-full`}>
      <div className="flex items-start">
        <div className="mr-3 mt-0.5 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-2 text-gray-400 hover:text-gray-200 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </GlassCard>
  );
};

// Convenience hook for adding notifications
export const useAddNotification = () => {
  const { addNotification } = useNotifications();

  const showNotification = (
    title: string,
    message: string,
    type: NotificationType = 'info',
    duration?: number
  ) => {
    addNotification({
      title,
      message,
      type,
      duration,
    });
  };

  return showNotification;
};