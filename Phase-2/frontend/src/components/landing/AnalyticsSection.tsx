'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

export default function AnalyticsSection() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const metrics = [
    { icon: TrendingUp, label: 'Completion Rate', value: '87%', change: '+12%' },
    { icon: Target, label: 'Tasks Completed', value: '247', change: '+34' },
    { icon: Zap, label: 'Productivity Score', value: '94', change: '+8' },
    { icon: Award, label: 'Current Streak', value: '14 days', change: 'Record!' },
  ];

  const weeklyData = [
    { day: 'Mon', value: 65, tasks: 8 },
    { day: 'Tue', value: 80, tasks: 12 },
    { day: 'Wed', value: 45, tasks: 6 },
    { day: 'Thu', value: 90, tasks: 14 },
    { day: 'Fri', value: 75, tasks: 10 },
    { day: 'Sat', value: 55, tasks: 7 },
    { day: 'Sun', value: 40, tasks: 5 },
  ];

  const monthlyData = Array.from({ length: 30 }, (_, i) => ({
    day: (i + 1).toString(),
    value: Math.floor(Math.random() * 60) + 40, // Random between 40-100
    tasks: Math.floor(Math.random() * 10) + 5, // Random between 5-15
  }));

  const chartData = timeRange === 'week' ? weeklyData : monthlyData;

  return (
    <section id="analytics" className="py-32 relative overflow-hidden">
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
            <span className="text-teal-400 text-sm font-medium">📊 Data-Driven Insights</span>
          </motion.div>
          
          <h2 className="text-5xl font-bold mb-4">
            Track Your <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Progress</span>
          </h2>
          <p className="text-xl text-slate-400">
            Understand your productivity patterns with detailed analytics
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-teal-500" />
                </div>
                <span className="text-sm text-teal-500 font-semibold">{metric.change}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-sm text-slate-400">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {timeRange === 'week' ? 'Weekly' : 'Monthly'} Productivity
              </h3>
              <p className="text-slate-400">Tasks completed per day</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'week'
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'month'
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 overflow-x-auto">
            {chartData.map((item, i) => (
              <motion.div
                key={`${timeRange}-${item.day}`}
                initial={{ height: 0 }}
                animate={{ height: `${item.value}%` }}
                transition={{ delay: i * 0.02, duration: 0.5 }}
                className="flex-1 min-w-[20px] bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg relative group cursor-pointer hover:from-teal-400 hover:to-teal-300 transition-all"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap z-10">
                  {item.tasks} tasks
                </div>
                <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-slate-400 font-medium ${
                  timeRange === 'month' ? 'text-xs' : ''
                }`}>
                  {item.day}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
