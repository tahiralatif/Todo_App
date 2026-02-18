'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Target,
  Zap,
  Calendar,
  ArrowRight,
  Sparkles,
  Activity,
  Bell,
  Circle
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import type { Task } from '@/types';
import { 
  requestNotificationPermission,
  subscribeToPushNotifications,
  hasNotificationPermission 
} from '@/lib/pushNotifications';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
    completionRate: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [dueTodayTasks, setDueTodayTasks] = useState<Task[]>([]);
  const [highPriorityTasks, setHighPriorityTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadDashboardData();
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = () => {
    setNotificationsEnabled(hasNotificationPermission());
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        const subscription = await subscribeToPushNotifications();
        
        if (subscription) {
          try {
            await api.subscribeToPush(subscription);
            setNotificationsEnabled(true);
            alert('✅ Notifications enabled! You will now receive task reminders.');
          } catch (error) {
            console.error('Failed to save subscription:', error);
            alert('Failed to save notification settings. Please try again.');
          }
        }
      } else {
        alert('❌ Please allow notifications in your browser settings to receive task reminders.');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [allTasks, completedTasks, pendingTasks] = await Promise.all([
        api.getTasks({ status: 'all', limit: 100 }),
        api.getTasks({ status: 'completed' }),
        api.getTasks({ status: 'pending' }),
      ]);

      const allTasksList = allTasks as Task[];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueToday = allTasksList.filter(t => {
        if (!t.due_date || t.completed) return false;
        const dueDate = new Date(t.due_date);
        return dueDate >= today && dueDate < tomorrow;
      });

      const overdue = allTasksList.filter(t => {
        if (!t.due_date || t.completed) return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today;
      });

      const highPriority = allTasksList.filter(t => 
        t.priority === 'HIGH' && !t.completed && !t.is_deleted
      );

      const total = (completedTasks as any).length + (pendingTasks as any).length;
      const completionRate = total > 0 ? Math.round(((completedTasks as any).length / total) * 100) : 0;

      setStats({
        total,
        completed: (completedTasks as any).length,
        pending: (pendingTasks as any).length,
        overdue: overdue.length,
        dueToday: dueToday.length,
        completionRate,
      });

      setRecentTasks(allTasksList.slice(0, 5));
      setDueTodayTasks(dueToday.slice(0, 3));
      setHighPriorityTasks(highPriority.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    try {
      await api.toggleTaskComplete(taskId);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E13] via-[#0B0F14] to-[#0D1117] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-slate-800 rounded-full" />
          <div className="w-16 h-16 border-2 border-teal-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E13] via-[#0B0F14] to-[#0D1117] p-8 relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(20,184,166,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(20,184,166,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl shadow-lg shadow-teal-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-teal-100 to-blue-100 bg-clip-text text-transparent tracking-tight">
                {greeting}! 👋
              </h1>
            </div>
            <p className="text-slate-400 text-lg">Here's your productivity overview for today</p>
          </div>
          <div className="flex gap-3">
            {!notificationsEnabled && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEnableNotifications}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25"
              >
                <Bell className="w-5 h-5" />
                Enable Reminders
              </motion.button>
            )}
            <Link
              href="/dashboard/tasks"
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2"
            >
              <span>New Task</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <span className="text-xs font-semibold text-blue-400">ALL TIME</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
                <p className="text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                  {stats.total}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-xs font-semibold text-emerald-400">{stats.completionRate}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
                <p className="text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                  {stats.completed}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg shadow-yellow-500/25">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                  <span className="text-xs font-semibold text-yellow-400">ACTIVE</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
                <p className="text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                  {stats.pending}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Overdue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-red-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-500/25">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                {stats.overdue > 0 && (
                  <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
                    <span className="text-xs font-semibold text-red-400">URGENT</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Overdue</p>
                <p className="text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                  {stats.overdue}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Priority Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Due Today */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/25">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Due Today
                </h3>
              </div>
              <Link
                href="/dashboard/tasks"
                className="text-teal-400 hover:text-teal-300 text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {dueTodayTasks.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No tasks due today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dueTodayTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group cursor-pointer"
                    onClick={() => handleToggleComplete(task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-slate-400 truncate mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created: {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {task.due_date && (
                          <span className="text-orange-400 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(task.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs font-semibold text-orange-400">
                      {task.priority}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* High Priority */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/25">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  High Priority
                </h3>
              </div>
              <Link
                href="/dashboard/tasks"
                className="text-teal-400 hover:text-teal-300 text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {highPriorityTasks.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No high priority tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {highPriorityTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group cursor-pointer"
                    onClick={() => handleToggleComplete(task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-slate-400 truncate mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created: {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {task.due_date && (
                          <span className="text-red-400 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(task.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-semibold text-red-400">
                      HIGH
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl shadow-lg shadow-teal-500/25">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Recent Activity
              </h3>
            </div>
            <Link
              href="/dashboard/tasks"
              className="text-teal-400 hover:text-teal-300 text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No tasks yet</p>
              <Link
                href="/dashboard/tasks"
                className="inline-block px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/25"
              >
                Create Your First Task
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group cursor-pointer"
                  onClick={() => handleToggleComplete(task.id)}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-600 group-hover:text-slate-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-slate-400 truncate mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created: {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {task.due_date && (
                        <span className={`flex items-center gap-1 font-semibold ${
                          new Date(task.due_date) < new Date() && !task.completed
                            ? 'text-red-400'
                            : 'text-teal-400'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(task.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/tasks"
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 hover:border-teal-500/50 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/0 group-hover:from-teal-500/10 group-hover:to-transparent transition-all duration-300" />
            <div className="relative z-10">
              <CheckCircle2 className="w-10 h-10 text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold mb-2 text-white">Manage Tasks</h4>
              <p className="text-sm text-slate-400">Create, edit, and organize your tasks</p>
            </div>
          </Link>

          <Link
            href="/dashboard/notifications"
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-transparent transition-all duration-300" />
            <div className="relative z-10">
              <Bell className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold mb-2 text-white">Notifications</h4>
              <p className="text-sm text-slate-400">Stay updated with your activity</p>
            </div>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300" />
            <div className="relative z-10">
              <TrendingUp className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold mb-2 text-white">Analytics</h4>
              <p className="text-sm text-slate-400">Track your productivity metrics</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
