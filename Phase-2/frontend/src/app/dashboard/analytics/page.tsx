'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MoreHorizontal,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import api from '@/lib/api';
import type { Task } from '@/types';

interface Stats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  dueToday: number;
  dueThisWeek: number;
  completedToday: number;
  completedThisWeek: number;
  completedLastWeek: number;
  avgCompletionTime: number;
}

interface ChartData {
  day: string;
  completed: number;
  created: number;
}

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    dueToday: 0,
    dueThisWeek: 0,
    completedToday: 0,
    completedThisWeek: 0,
    completedLastWeek: 0,
    avgCompletionTime: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks({ status: 'all', include_deleted: false });
      const taskList = data as Task[];
      setTasks(taskList);
      calculateStats(taskList);
      generateChartData(taskList);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (taskList: Task[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const data = last7Days.map(date => {
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const completed = taskList.filter(t => {
        if (!t.completed) return false;
        const updatedDate = new Date(t.updated_at || t.created_at);
        return updatedDate >= dayStart && updatedDate < dayEnd;
      }).length;

      const created = taskList.filter(t => {
        const createdDate = new Date(t.created_at);
        return createdDate >= dayStart && createdDate < dayEnd;
      }).length;

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        created,
      };
    });

    setChartData(data);
  };

  const calculateStats = (taskList: Task[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const completed = taskList.filter(t => t.completed).length;
    const pending = taskList.filter(t => !t.completed).length;
    const overdue = taskList.filter(t => 
      !t.completed && t.due_date && new Date(t.due_date) < now
    ).length;

    const highPriority = taskList.filter(t => t.priority === 'HIGH').length;
    const mediumPriority = taskList.filter(t => t.priority === 'MEDIUM').length;
    const lowPriority = taskList.filter(t => t.priority === 'LOW').length;

    const dueToday = taskList.filter(t => {
      if (!t.due_date || t.completed) return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length;

    const dueThisWeek = taskList.filter(t => {
      if (!t.due_date || t.completed) return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= today && dueDate < weekFromNow;
    }).length;

    const completedToday = taskList.filter(t => {
      if (!t.completed) return false;
      const updatedDate = new Date(t.updated_at || t.created_at);
      return updatedDate >= today;
    }).length;

    const completedThisWeek = taskList.filter(t => {
      if (!t.completed) return false;
      const updatedDate = new Date(t.updated_at || t.created_at);
      return updatedDate >= weekAgo;
    }).length;

    const completedLastWeek = taskList.filter(t => {
      if (!t.completed) return false;
      const updatedDate = new Date(t.updated_at || t.created_at);
      return updatedDate >= twoWeeksAgo && updatedDate < weekAgo;
    }).length;

    const completionRate = taskList.length > 0 
      ? Math.round((completed / taskList.length) * 100) 
      : 0;

    setStats({
      total: taskList.length,
      completed,
      pending,
      overdue,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      dueToday,
      dueThisWeek,
      completedToday,
      completedThisWeek,
      completedLastWeek,
      avgCompletionTime: 0,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-slate-800 rounded-full" />
          <div className="w-16 h-16 border-2 border-teal-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  const weeklyChange = stats.completedLastWeek > 0 
    ? ((stats.completedThisWeek - stats.completedLastWeek) / stats.completedLastWeek) * 100 
    : stats.completedThisWeek > 0 ? 100 : 0;

  const maxChartValue = Math.max(...chartData.map(d => Math.max(d.completed, d.created)), 1);

  return (
    <div className="min-h-screen bg-[#0B0F14] p-8 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
        
        {/* Floating Squares */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-[10%] w-32 h-32 border border-teal-500/10 rounded-2xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-40 right-[15%] w-24 h-24 border border-blue-500/10 rounded-2xl"
        />
        <motion.div
          animate={{
            y: [0, -40, 0],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-32 left-[20%] w-40 h-40 border border-purple-500/10 rounded-3xl"
        />
        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -180, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-[25%] w-28 h-28 border border-emerald-500/10 rounded-2xl"
        />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-slate-400 mt-2">Monitor your productivity and task performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-all">
              <Calendar className="w-4 h-4" />
              Last 7 days
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <div className="w-6 h-6 bg-blue-500 rounded-lg" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-400">Total Tasks</p>
              <p className="text-4xl font-bold text-white tracking-tight">{stats.total}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-slate-500">All time</span>
            </div>
          </motion.div>

          {/* Completion Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-teal-500/10 rounded-xl">
                <div className="w-6 h-6 bg-teal-500 rounded-lg" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-400">Completion Rate</p>
              <p className="text-4xl font-bold text-white tracking-tight">{stats.completionRate}%</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              {weeklyChange > 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">+{weeklyChange.toFixed(1)}%</span>
                </>
              ) : weeklyChange < 0 ? (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">{weeklyChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 font-medium">0%</span>
                </>
              )}
              <span className="text-slate-500">vs last week</span>
            </div>
          </motion.div>

          {/* Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <div className="w-6 h-6 bg-emerald-500 rounded-lg" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-400">Completed</p>
              <p className="text-4xl font-bold text-white tracking-tight">{stats.completed}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md font-medium">
                {stats.completedThisWeek} this week
              </span>
            </div>
          </motion.div>

          {/* Overdue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-red-500/10 rounded-xl">
                <div className="w-6 h-6 bg-red-500 rounded-lg" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-400">Overdue</p>
              <p className="text-4xl font-bold text-white tracking-tight">{stats.overdue}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              {stats.overdue > 0 ? (
                <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-md font-medium">
                  Needs attention
                </span>
              ) : (
                <span className="px-2 py-1 bg-slate-500/10 text-slate-400 rounded-md font-medium">
                  All clear
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-white">Activity Overview</h2>
                <p className="text-sm text-slate-400 mt-1">Task creation and completion trends</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  <span className="text-xs font-medium text-slate-400">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-slate-400">Created</span>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end justify-between gap-4">
                {chartData.map((data, index) => (
                  <div key={data.day} className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full flex items-end justify-center gap-2 h-52">
                      {/* Completed Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.completed / maxChartValue) * 100}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5, ease: 'easeOut' }}
                        className="flex-1 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg relative group cursor-pointer"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="px-2 py-1 bg-slate-900 border border-white/10 rounded text-xs font-medium text-white whitespace-nowrap">
                            {data.completed}
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Created Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.created / maxChartValue) * 100}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5, ease: 'easeOut' }}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group cursor-pointer"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="px-2 py-1 bg-slate-900 border border-white/10 rounded text-xs font-medium text-white whitespace-nowrap">
                            {data.created}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    
                    <span className="text-xs font-medium text-slate-400">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Priority Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white">Priority</h2>
              <p className="text-sm text-slate-400 mt-1">Task distribution</p>
            </div>

            {/* Donut Chart */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="20"
                  fill="none"
                  className="text-white/5"
                />
                
                <motion.circle
                  cx="96"
                  cy="96"
                  r="70"
                  stroke="#ef4444"
                  strokeWidth="20"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 440" }}
                  animate={{ 
                    strokeDasharray: `${stats.total > 0 ? (stats.highPriority / stats.total) * 440 : 0} 440`,
                  }}
                  transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
                />
                
                <motion.circle
                  cx="96"
                  cy="96"
                  r="70"
                  stroke="#eab308"
                  strokeWidth="20"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 440" }}
                  animate={{ 
                    strokeDasharray: `${stats.total > 0 ? (stats.mediumPriority / stats.total) * 440 : 0} 440`,
                    strokeDashoffset: stats.total > 0 ? -(stats.highPriority / stats.total) * 440 : 0
                  }}
                  transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                />
                
                <motion.circle
                  cx="96"
                  cy="96"
                  r="70"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 440" }}
                  animate={{ 
                    strokeDasharray: `${stats.total > 0 ? (stats.lowPriority / stats.total) * 440 : 0} 440`,
                    strokeDashoffset: stats.total > 0 ? -((stats.highPriority + stats.mediumPriority) / stats.total) * 440 : 0
                  }}
                  transition={{ delay: 0.9, duration: 1, ease: 'easeOut' }}
                />
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-slate-400 mt-1">Total</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-slate-300">High</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">
                    {stats.total > 0 ? Math.round((stats.highPriority / stats.total) * 100) : 0}%
                  </span>
                  <span className="text-sm font-bold text-white">{stats.highPriority}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium text-slate-300">Medium</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">
                    {stats.total > 0 ? Math.round((stats.mediumPriority / stats.total) * 100) : 0}%
                  </span>
                  <span className="text-sm font-bold text-white">{stats.mediumPriority}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-slate-300">Low</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">
                    {stats.total > 0 ? Math.round((stats.lowPriority / stats.total) * 100) : 0}%
                  </span>
                  <span className="text-sm font-bold text-white">{stats.lowPriority}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-400">Completed Today</h3>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.completedToday}</p>
            <p className="text-xs text-slate-500 mt-2">
              {stats.total > 0 ? Math.round((stats.completedToday / stats.total) * 100) : 0}% of total
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-400">Due Today</h3>
              <Calendar className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.dueToday}</p>
            <p className="text-xs text-slate-500 mt-2">
              {stats.dueThisWeek} due this week
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-400">In Progress</h3>
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
            <p className="text-xs text-slate-500 mt-2">
              {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
