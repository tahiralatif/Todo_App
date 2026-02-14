'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Trash2, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import type { Task } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    deleted: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [allTasks, completedTasks, pendingTasks, deletedTasks] = await Promise.all([
        api.getTasks({ status: 'all', limit: 5 }),
        api.getTasks({ status: 'completed' }),
        api.getTasks({ status: 'pending' }),
        api.getTasks({ status: 'deleted', include_deleted: true }),
      ]);

      setStats({
        total: (completedTasks as any).length + (pendingTasks as any).length,
        completed: (completedTasks as any).length,
        pending: (pendingTasks as any).length,
        deleted: (deletedTasks as any).length,
      });

      setRecentTasks(allTasks as Task[]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Tasks',
      value: stats.total,
      icon: CheckCircle2,
      color: 'teal',
      bgColor: 'bg-teal-500/20',
      borderColor: 'border-teal-500/30',
      textColor: 'text-teal-400',
    },
    {
      name: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'green',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
    },
    {
      name: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
    },
    {
      name: 'Deleted',
      value: stats.deleted,
      icon: Trash2,
      color: 'red',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome Back! 👋</h2>
        <p className="text-slate-400">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} border ${stat.borderColor} rounded-2xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <TrendingUp className={`w-5 h-5 ${stat.textColor}`} />
            </div>
            <p className="text-slate-400 text-sm mb-1">{stat.name}</p>
            <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Recent Tasks</h3>
          <Link
            href="/dashboard/tasks"
            className="text-teal-400 hover:text-teal-300 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No tasks yet</p>
            <Link
              href="/dashboard/tasks"
              className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all"
            >
              Create Your First Task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  task.completed
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-slate-600'
                }`}>
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-slate-400 truncate">{task.description}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/tasks"
          className="p-6 bg-slate-900/80 border border-slate-700/50 rounded-2xl hover:border-teal-500/50 transition-all group"
        >
          <CheckCircle2 className="w-8 h-8 text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold mb-2">Manage Tasks</h4>
          <p className="text-sm text-slate-400">Create, edit, and organize your tasks</p>
        </Link>

        <Link
          href="/dashboard/notifications"
          className="p-6 bg-slate-900/80 border border-slate-700/50 rounded-2xl hover:border-teal-500/50 transition-all group"
        >
          <TrendingUp className="w-8 h-8 text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold mb-2">View Notifications</h4>
          <p className="text-sm text-slate-400">Stay updated with your activity</p>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="p-6 bg-slate-900/80 border border-slate-700/50 rounded-2xl hover:border-teal-500/50 transition-all group"
        >
          <TrendingUp className="w-8 h-8 text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold mb-2">View Analytics</h4>
          <p className="text-sm text-slate-400">Track your productivity metrics</p>
        </Link>
      </div>
    </div>
  );
}
