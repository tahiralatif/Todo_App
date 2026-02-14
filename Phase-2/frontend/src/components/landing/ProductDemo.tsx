'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Bell, BarChart3, Calendar, Filter, Plus, Search } from 'lucide-react';

const tabs = [
  { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

export default function ProductDemo() {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <section id="product" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full"
          >
            <span className="text-teal-400 text-sm font-medium">🎯 Interactive Demo</span>
          </motion.div>
          
          <h2 className="text-5xl font-bold mb-4">
            See it in <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Action</span>
          </h2>
          <p className="text-xl text-slate-400">
            A complete productivity system at your fingertips
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {tabs.map((tab, i) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 10 }}
                className={`w-full flex items-center gap-4 p-6 rounded-2xl border transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/20'
                    : 'bg-slate-900/80 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === tab.id 
                    ? 'bg-teal-500 shadow-lg shadow-teal-500/50' 
                    : 'bg-slate-800'
                }`}>
                  <tab.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-semibold text-white">{tab.label}</h3>
                  <p className="text-sm text-slate-400">
                    {tab.id === 'tasks' && 'Create, organize, and complete tasks'}
                    {tab.id === 'notifications' && 'Stay updated with real-time alerts'}
                    {tab.id === 'analytics' && 'Track your productivity metrics'}
                    {tab.id === 'calendar' && 'Visualize tasks in calendar view'}
                  </p>
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1 h-12 bg-teal-500 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Right - Demo Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <AnimatePresence mode="wait">
                {activeTab === 'tasks' && (
                  <motion.div
                    key="tasks"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold">My Tasks</h3>
                      <div className="flex gap-2">
                        <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                          <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                          <Filter className="w-5 h-5" />
                        </button>
                        <button className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-400 transition-colors flex items-center gap-2">
                          <Plus className="w-5 h-5" />
                          Add Task
                        </button>
                      </div>
                    </div>
                    
                    {['Design review meeting', 'Update API documentation', 'Code review for PR #234', 'Team standup'].map((task, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-4 bg-slate-800/80 rounded-xl hover:bg-slate-800 transition-all cursor-pointer group"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-teal-500 transition-colors" />
                        <span className="text-slate-300 group-hover:text-white transition-colors flex-1">{task}</span>
                        <span className="text-xs text-slate-500">Today</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold">Notifications</h3>
                      <span className="px-3 py-1 bg-teal-500 rounded-full text-sm font-semibold">3 new</span>
                    </div>
                    
                    {[
                      { title: 'Task completed', desc: 'Design review meeting marked as done', time: '2m ago', unread: true },
                      { title: 'New task assigned', desc: 'Update API documentation', time: '1h ago', unread: true },
                      { title: 'Reminder', desc: 'Team standup in 30 minutes', time: '2h ago', unread: false },
                    ].map((notif, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl transition-all cursor-pointer ${
                          notif.unread 
                            ? 'bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20' 
                            : 'bg-slate-800/80 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-white mb-1">{notif.title}</p>
                            <p className="text-sm text-slate-400">{notif.desc}</p>
                            <p className="text-xs text-slate-500 mt-2">{notif.time}</p>
                          </div>
                          {notif.unread && <div className="w-2 h-2 bg-teal-500 rounded-full mt-2" />}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-2xl font-bold mb-6">Productivity Overview</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { label: 'Completed', value: '47', color: 'teal', icon: '✓' },
                        { label: 'In Progress', value: '12', color: 'blue', icon: '⟳' },
                        { label: 'Completion Rate', value: '87%', color: 'green', icon: '📈' },
                        { label: 'Streak', value: '14 days', color: 'purple', icon: '🔥' },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 bg-slate-800/80 rounded-xl hover:bg-slate-800 transition-all"
                        >
                          <div className="text-2xl mb-2">{stat.icon}</div>
                          <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <p className="text-sm text-slate-400 mb-4">Weekly Activity</p>
                      <div className="h-40 flex items-end justify-around gap-2">
                        {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="flex-1 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t hover:from-teal-400 hover:to-teal-300 transition-all cursor-pointer"
                          />
                        ))}
                      </div>
                      <div className="flex justify-around mt-2 text-xs text-slate-500">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'calendar' && (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold">February 2026</h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition-colors">Today</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-sm text-slate-400 font-medium py-2">
                          {day}
                        </div>
                      ))}
                      
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: day * 0.01 }}
                          className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer ${
                            day === 14
                              ? 'bg-teal-500 text-white font-bold shadow-lg shadow-teal-500/50'
                              : day % 7 === 0
                              ? 'bg-slate-800/30 text-slate-500'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {day}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent rounded-2xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
