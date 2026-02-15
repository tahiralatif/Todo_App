'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertCircle } from 'lucide-react';

export default function NotificationBlockedAlert() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Check if notifications are blocked
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'denied') {
        setShowAlert(true);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
        <div className="bg-gradient-to-br from-orange-900/90 to-red-900/90 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white mb-1">
                Notifications Blocked
              </h3>
              <p className="text-xs text-orange-200 mb-3">
                You won't receive task reminders. To enable:
              </p>
              
              <div className="bg-black/20 rounded-lg p-3 mb-3">
                <p className="text-xs text-orange-100 font-semibold mb-2">Quick Fix:</p>
                <ol className="text-xs text-orange-100 space-y-2 list-decimal list-inside">
                  <li>Look at the <span className="font-semibold">very top of your browser</span> where you see the website address</li>
                  <li>Click anywhere in that URL area (left side)</li>
                  <li>You'll see a popup with <span className="font-semibold">"Permissions"</span> or <span className="font-semibold">"Site settings"</span></li>
                  <li>Find <span className="font-semibold">"Notifications"</span> and change to <span className="font-semibold">"Allow"</span></li>
                  <li>Refresh page (F5)</li>
                </ol>
                
                <div className="mt-3 pt-3 border-t border-orange-500/20">
                  <p className="text-xs text-orange-200 mb-1">Or use browser menu:</p>
                  <p className="text-xs text-orange-100">Settings → Privacy → Site Settings → Notifications → Allow this site</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    alert('How to Enable Notifications:\n\n📍 METHOD 1 (Easiest):\n1. Look at the TOP LEFT of your browser\n2. Click on the URL area (where it says localhost:3000)\n3. A popup will appear\n4. Find "Notifications" and select "Allow"\n5. Refresh the page\n\n📍 METHOD 2 (Browser Settings):\nChrome/Edge:\n- Click the 3 dots (⋮) → Settings\n- Privacy and security → Site Settings\n- Notifications → Add → localhost:3000\n\nFirefox:\n- Click the 3 lines (☰) → Settings\n- Privacy & Security → Permissions\n- Notifications → Settings → Allow localhost:3000\n\nDone! 🔔');
                  }}
                  className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-xs font-semibold text-white transition-all"
                >
                  Detailed Steps
                </button>
                <button
                  onClick={() => setShowAlert(false)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white transition-all"
                >
                  Later
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setShowAlert(false)}
              className="text-orange-300 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
