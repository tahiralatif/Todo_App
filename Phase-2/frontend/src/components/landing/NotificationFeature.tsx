'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Smartphone, Clock, Check, Zap } from 'lucide-react';

export default function NotificationFeature() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block mb-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <span className="text-yellow-400 text-sm font-medium">🔔 Never Miss a Deadline</span>
            </div>
            
            <h2 className="text-5xl font-bold mb-6">
              Smart <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Reminders</span>
            </h2>
            
            <p className="text-xl text-slate-300 mb-8">
              Get browser notifications 15 minutes before your tasks are due - even when the app is closed!
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {[
                {
                  icon: Bell,
                  title: 'Browser Notifications',
                  description: 'Native notifications on desktop and mobile browsers'
                },
                {
                  icon: Clock,
                  title: 'Smart Timing',
                  description: 'Alerts 15 minutes before due time with countdown'
                },
                {
                  icon: Smartphone,
                  title: 'Works Everywhere',
                  description: 'Even when app is closed or you\'re on another tab'
                },
                {
                  icon: Zap,
                  title: 'One-Time Setup',
                  description: 'Just click "Enable" once and you\'re all set'
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-teal-500/50 transition-all"
                >
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* How It Works */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-teal-400" />
                How It Works
              </h4>
              <ol className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Create a task with a due date and time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Click "Enable" when prompted (one-time setup)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Get notified 15 minutes before it's due</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Click notification to open task directly</span>
                </li>
              </ol>
            </div>
          </motion.div>

          {/* Right: Visual Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Phone Mockup */}
            <div className="relative mx-auto max-w-sm">
              {/* Phone Frame */}
              <div className="relative bg-slate-900 border-8 border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-3xl z-10" />
                
                {/* Screen */}
                <div className="relative bg-gradient-to-b from-slate-950 to-slate-900 p-6 pt-12 pb-8 min-h-[600px]">
                  {/* Time */}
                  <div className="text-center mb-8">
                    <div className="text-6xl font-bold text-white mb-2">
                      {currentTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                    <div className="text-slate-400">
                      {currentTime.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  {/* Notification Cards */}
                  <div className="space-y-4">
                    {/* Notification 1 - Animated */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 backdrop-blur-xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-500 rounded-lg">
                          <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white text-sm">Execute Todo</span>
                            <span className="text-xs text-slate-400">now</span>
                          </div>
                          <p className="text-sm text-slate-200 font-medium mb-1">Task Due Soon</p>
                          <p className="text-xs text-slate-300">
                            "Complete Project Report" is due in 15 minutes!
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Notification 2 */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-teal-500 rounded-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white text-sm">Execute Todo</span>
                            <span className="text-xs text-slate-400">5m ago</span>
                          </div>
                          <p className="text-sm text-slate-200 font-medium mb-1">Task Completed</p>
                          <p className="text-xs text-slate-300">
                            You completed "Team Meeting"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Floating Icons */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-32 right-8 p-3 bg-teal-500/20 rounded-full backdrop-blur-xl"
                  >
                    <Bell className="w-6 h-6 text-teal-400" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute bottom-32 left-8 p-3 bg-yellow-500/20 rounded-full backdrop-blur-xl"
                  >
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
