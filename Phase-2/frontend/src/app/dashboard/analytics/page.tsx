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
  Filter,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity
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
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks({ status: 'all', include_deleted: false });
      const taskList = data as Task[];
      setTasks(taskList);
      calculateStats(taskList);
      generateChartData(taskList, timeRange);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (taskList: Task[], range: string) => {
    if (range === '30d') {
      // Monthly view - last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date;
      });

      const data = last30Days.map(date => {
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
          day: date.getDate().toString(),
          completed,
          created,
        };
      });

      setChartData(data);
    } else {
      // Weekly view - last 7 days
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
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E13] via-[#0B0F14] to-[#0D1117] p-8 relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sophisticated Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(20,184,166,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(20,184,166,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Animated Gradient Mesh */}
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
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"
        />
        
        {/* Floating Geometric Shapes - Silicon Valley Style */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-[8%] w-40 h-40 border border-teal-500/10 rounded-3xl backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(20,184,166,0.05) 0%, transparent 100%)'
          }}
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            rotate: [0, -180, -360],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-60 right-[12%] w-32 h-32 border border-blue-500/10 rounded-2xl backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, transparent 100%)'
          }}
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            rotate: [0, 270, 540],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-40 left-[15%] w-48 h-48 border border-purple-500/10 rounded-[2rem] backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, transparent 100%)'
          }}
        />
        <motion.div
          animate={{
            y: [0, 35, 0],
            rotate: [0, -270, -540],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-32 right-[20%] w-36 h-36 border border-emerald-500/10 rounded-3xl backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 100%)'
          }}
        />
        
        {/* Additional Accent Shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 left-[5%] w-20 h-20 border border-cyan-500/10 rounded-xl"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-[8%] w-24 h-24 border border-pink-500/10 rounded-2xl"
        />
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        {/* Premium Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-teal-100 to-blue-100 bg-clip-text text-transparent tracking-tight">
                Analytics Dashboard
              </h1>
            </motion.div>
            <p className="text-slate-400 text-lg">Real-time insights into your productivity metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeRange === '7d'
                    ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg shadow-teal-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeRange === '30d'
                    ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg shadow-teal-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-teal-500/25"
            >
              <Download className="w-4 h-4" />
              Export Report
            </motion.button>
          </div>
        </div>

        {/* Premium Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
          >
            {/* Glow Effect */}
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
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500 font-medium">Lifetime productivity</p>
              </div>
            </div>
          </motion.div>

          {/* Completion Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-teal-500/50 transition-all duration-300 overflow-hidden"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/0 group-hover:from-teal-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg shadow-teal-500/25">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                {weeklyChange !== 0 && (
                  <div className={`px-3 py-1 ${weeklyChange > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} border rounded-full flex items-center gap-1`}>
                    {weeklyChange > 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-xs font-semibold ${weeklyChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {Math.abs(weeklyChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</p>
                <p className="text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                  {stats.completionRate}%
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500 font-medium">
                  {weeklyChange > 0 ? '↑' : weeklyChange < 0 ? '↓' : '→'} vs last week
                </p>
              </div>
            </div>
          </motion.div>

          {/* Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-xs font-semibold text-emerald-400">{stats.completedThisWeek} THIS WEEK</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
                <p className="text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                  {stats.completed}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500 font-medium">
                  {stats.completedToday} completed today
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
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-500/25">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                {stats.overdue > 0 ? (
                  <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
                    <span className="text-xs font-semibold text-red-400">URGENT</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-xs font-semibold text-emerald-400">ALL CLEAR</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Overdue</p>
                <p className="text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
                  {stats.overdue}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500 font-medium">
                  {stats.overdue > 0 ? 'Needs immediate attention' : 'On track'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Premium Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Activity Overview
                </h2>
                <p className="text-sm text-slate-400 mt-2">Task creation and completion trends over time</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/50" />
                  <span className="text-xs font-semibold text-slate-300">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50" />
                  <span className="text-xs font-semibold text-slate-300">Created</span>
                </div>
              </div>
            </div>

            {/* Enhanced Bar Chart with Horizontal Scroll for Monthly */}
            <div className="relative h-72">
              {/* Y-axis labels - Better scaling */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500 font-medium z-10 bg-gradient-to-r from-[#0B0F14] to-transparent pr-2">
                <span>{Math.max(maxChartValue, 5)}</span>
                <span>{Math.max(Math.floor(maxChartValue * 0.75), 4)}</span>
                <span>{Math.max(Math.floor(maxChartValue * 0.5), 3)}</span>
                <span>{Math.max(Math.floor(maxChartValue * 0.25), 1)}</span>
                <span>0</span>
              </div>
              
              {/* Scrollable Container for Monthly View */}
              <div className={`absolute left-12 right-0 top-0 bottom-0 ${timeRange === '30d' ? 'overflow-x-auto' : 'overflow-hidden'}`}>
                <div className={`relative h-full ${timeRange === '30d' ? 'min-w-[1200px]' : 'w-full'}`}>
                  {/* Grid lines */}
                  <div className="absolute inset-0 bottom-8 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full h-px bg-white/5" />
                    ))}
                  </div>
                  
                  {/* Empty State */}
                  {maxChartValue === 1 && chartData.every(d => d.completed === 0 && d.created === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                          <Activity className="w-10 h-10 text-slate-500" />
                        </div>
                        <p className="text-slate-400 font-semibold mb-2">No activity yet</p>
                        <p className="text-sm text-slate-500">Create and complete tasks to see your progress</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 flex items-end justify-between gap-3 pb-8">
                    {chartData.map((data, index) => {
                      // Use better scaling for low values - minimum 8% height for visibility
                      const completedHeight = data.completed > 0 
                        ? Math.max((data.completed / Math.max(maxChartValue, 5)) * 100, 8)
                        : 0;
                      const createdHeight = data.created > 0 
                        ? Math.max((data.created / Math.max(maxChartValue, 5)) * 100, 8)
                        : 0;
                      
                      return (
                        <div key={`${data.day}-${index}`} className="flex-1 flex flex-col items-center gap-3" style={{ minWidth: timeRange === '30d' ? '32px' : 'auto' }}>
                          <div className="w-full flex items-end justify-center gap-1.5 h-56">
                            {/* Completed Bar - Enhanced with better visibility */}
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ 
                                height: `${completedHeight}%`,
                                opacity: data.completed > 0 ? 1 : 0.3
                              }}
                              transition={{ delay: 0.6 + (index * 0.02), duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                              className={`flex-1 rounded-t-lg relative group cursor-pointer transition-all ${
                                data.completed > 0 
                                  ? 'bg-gradient-to-t from-teal-600 via-teal-500 to-emerald-400 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40' 
                                  : 'bg-gradient-to-t from-slate-700 to-slate-600 border border-white/5'
                              }`}
                              style={{ minHeight: data.completed > 0 ? '16px' : '6px', minWidth: '8px' }}
                            >
                              {data.completed > 0 && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-none">
                                  <div className="px-2.5 py-1.5 bg-slate-900 border border-teal-500/30 rounded-lg text-xs font-bold text-white whitespace-nowrap shadow-xl">
                                    <div className="text-teal-400">{data.day}</div>
                                    <div>{data.completed} done</div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                            
                            {/* Created Bar - Enhanced with better visibility */}
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ 
                                height: `${createdHeight}%`,
                                opacity: data.created > 0 ? 1 : 0.3
                              }}
                              transition={{ delay: 0.6 + (index * 0.02), duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                              className={`flex-1 rounded-t-lg relative group cursor-pointer transition-all ${
                                data.created > 0 
                                  ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40' 
                                  : 'bg-gradient-to-t from-slate-700 to-slate-600 border border-white/5'
                              }`}
                              style={{ minHeight: data.created > 0 ? '16px' : '6px', minWidth: '8px' }}
                            >
                              {data.created > 0 && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-none">
                                  <div className="px-2.5 py-1.5 bg-slate-900 border border-blue-500/30 rounded-lg text-xs font-bold text-white whitespace-nowrap shadow-xl">
                                    <div className="text-blue-400">{data.day}</div>
                                    <div>{data.created} new</div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </div>
                          
                          <span className={`font-bold text-slate-400 uppercase tracking-wider ${timeRange === '30d' ? 'text-[10px]' : 'text-xs'}`}>
                            {data.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Scroll Indicator for Monthly View */}
              {timeRange === '30d' && (
                <div className="absolute bottom-0 right-0 px-3 py-1.5 bg-gradient-to-l from-[#0B0F14] via-[#0B0F14] to-transparent">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Scroll →</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Priority Distribution - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Priority
              </h2>
              <p className="text-sm text-slate-400 mt-2">Task distribution by priority level</p>
            </div>

            {/* Enhanced Donut Chart */}
            <div className="relative w-52 h-52 mx-auto mb-8">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
              
              <svg className="transform -rotate-90 w-52 h-52 relative z-10">
                <circle
                  cx="104"
                  cy="104"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="24"
                  fill="none"
                  className="text-white/5"
                />
                
                <motion.circle
                  cx="104"
                  cy="104"
                  r="80"
                  stroke="url(#gradient-red)"
                  strokeWidth="24"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 502" }}
                  animate={{ 
                    strokeDasharray: `${stats.total > 0 ? (stats.highPriority / stats.total) * 502 : 0} 502`,
                  }}
                  transition={{ delay: 0.7, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  className="drop-shadow-lg"
                />
                
                <motion.circle
                  cx="104"
                  cy="104"
                  r="80"
                  stroke="url(#gradient-yellow)"
                  strokeWidth="24"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 502" }}
                  animate={{ 
                    strokeDasharray: `${stats.total > 0 ? (stats.mediumPriority / stats.total) * 502 : 0} 502`,
                    strokeDashoffset: stats.total > 0 ? -(stats.highPriority / stats.total) * 502 : 0
                  }}
                  transition={{ delay: 0.8, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  className="drop-shadow-lg"
                />
                
                <motion.circle
                  cx="104"
                  cy="104"
                  r="80"
                  stroke="url(#gradient-blue)"
                  strokeWidth="24"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 502" }}
                  animate={{ 
                    strokeDasharray: `${stats.total > 0 ? (stats.lowPriority / stats.total) * 502 : 0} 502`,
                    strokeDashoffset: stats.total > 0 ? -((stats.highPriority + stats.mediumPriority) / stats.total) * 502 : 0
                  }}
                  transition={{ delay: 0.9, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  className="drop-shadow-lg"
                />
                
                {/* Gradient Definitions */}
                <defs>
                  <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </linearGradient>
                  <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
                    {stats.total}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-semibold uppercase tracking-wider">Total Tasks</div>
                </div>
              </div>
            </div>

            {/* Enhanced Legend */}
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-xl hover:border-red-500/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50" />
                  <span className="text-sm font-semibold text-slate-200">High Priority</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 font-medium">
                    {stats.total > 0 ? Math.round((stats.highPriority / stats.total) * 100) : 0}%
                  </span>
                  <span className="text-lg font-bold text-white min-w-[2rem] text-right">{stats.highPriority}</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50" />
                  <span className="text-sm font-semibold text-slate-200">Medium Priority</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 font-medium">
                    {stats.total > 0 ? Math.round((stats.mediumPriority / stats.total) * 100) : 0}%
                  </span>
                  <span className="text-lg font-bold text-white min-w-[2rem] text-right">{stats.mediumPriority}</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50" />
                  <span className="text-sm font-semibold text-slate-200">Low Priority</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 font-medium">
                    {stats.total > 0 ? Math.round((stats.lowPriority / stats.total) * 100) : 0}%
                  </span>
                  <span className="text-lg font-bold text-white min-w-[2rem] text-right">{stats.lowPriority}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Premium Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Completed Today</h3>
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/25">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent mb-4">
                {stats.completedToday}
              </p>
              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.total > 0 ? (stats.completedToday / stats.total) * 100 : 0}%` }}
                    transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                  />
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {stats.total > 0 ? Math.round((stats.completedToday / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Due Today</h3>
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/25">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent mb-4">
                {stats.dueToday}
              </p>
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">This week</span>
                  <span className="font-bold text-orange-400">{stats.dueThisWeek} tasks</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-transparent transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">In Progress</h3>
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg shadow-yellow-500/25 relative">
                  <Activity className="w-5 h-5 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent mb-4">
                {stats.pending}
              </p>
              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                    transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
                  />
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
