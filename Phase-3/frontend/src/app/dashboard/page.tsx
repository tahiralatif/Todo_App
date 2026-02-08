'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainCanvas from '@/components/layout/MainCanvas';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import CommandBar from '@/components/dashboard/CommandBar';
import TodayFocusCard from '@/components/dashboard/TodayFocusCard';
import RecentTasks from '@/components/dashboard/RecentTasks';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTaskStore } from '@/services/state/store';

const DashboardPage = () => {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const { currentView, setCurrentView } = useTaskStore();

  // Define sidebar items
  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/settings' },
  ];

  // Handle keyboard shortcut for command bar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ProtectedRoute>
      <MainCanvas>
        <Navbar />
        <CommandBar
          isOpen={isCommandBarOpen}
          onClose={() => setIsCommandBarOpen(false)}
        />

        <div className="flex h-full pt-16">
          {/* Sidebar */}
          <div className="hidden md:block w-64 mr-4">
            <Sidebar items={sidebarItems} title="Todo App" />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`px-4 py-2 rounded-lg ${
                    currentView === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setCurrentView('kanban')}
                  className={`px-4 py-2 rounded-lg ${
                    currentView === 'kanban'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setCurrentView('timeline')}
                  className={`px-4 py-2 rounded-lg ${
                    currentView === 'timeline'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Timeline
                </button>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <GlassCard className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">24</div>
                <div className="text-sm text-gray-400">Total Tasks</div>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">18</div>
                <div className="text-sm text-gray-400">Completed</div>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">4</div>
                <div className="text-sm text-gray-400">Due Today</div>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">92%</div>
                <div className="text-sm text-gray-400">Productivity</div>
              </GlassCard>
            </motion.div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <TodayFocusCard />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <RecentTasks />
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Add Task
                  </button>
                  <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Set Reminder
                  </button>
                  <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Schedule Meeting
                  </button>
                  <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Export Data
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </MainCanvas>
    </ProtectedRoute>
  );
};

export default DashboardPage;