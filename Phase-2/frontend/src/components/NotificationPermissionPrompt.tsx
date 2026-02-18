'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { 
  isPushNotificationSupported, 
  requestNotificationPermission,
  subscribeToPushNotifications,
  hasNotificationPermission 
} from '@/lib/pushNotifications';
import api from '@/lib/api';

export default function NotificationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const checkPermission = () => {
      if (!isPushNotificationSupported()) {
        return;
      }

      // Don't show if already granted or denied
      if (Notification.permission !== 'default') {
        return;
      }

      // Don't show if user dismissed it recently (within 7 days)
      const dismissedAt = localStorage.getItem('notificationPromptDismissed');
      if (dismissedAt) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
          return;
        }
      }

      // Show prompt after 5 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    checkPermission();
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        // Subscribe to push notifications
        const subscription = await subscribeToPushNotifications();
        
        if (subscription) {
          // Send subscription to backend
          try {
            await api.subscribeToPush(subscription);
            console.log('Push subscription saved to backend');
          } catch (error) {
            console.error('Failed to save subscription to backend:', error);
          }
          
          // Show success message
          alert('✅ Notifications enabled! You will now receive task reminders.');
        }
      } else {
        alert('❌ Notification permission denied. You can enable it later in browser settings.');
      }
      
      setShowPrompt(false);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationPromptDismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-50 max-w-md"
      >
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-teal-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <Bell className="w-6 h-6 text-teal-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                Enable Task Reminders
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                Get notified when your tasks are due, even when the app is closed. 
                Never miss a deadline!
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleEnable}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enabling...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Enable
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDismiss}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              disabled={isLoading}
              className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
