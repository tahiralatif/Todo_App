'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, Bell, Calendar, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-4 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full"
          >
            <span className="text-teal-400 text-sm font-medium">🚀 Trusted by 10,000+ teams</span>
          </motion.div>

          <motion.h1 
            className="text-6xl lg:text-7xl font-bold leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Execute with
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
              Clarity
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-slate-400 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Structured task management. Smart notifications. Clean execution workflow.
            Built for focused builders and modern teams.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/signup"
              className="group px-8 py-4 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-teal-500/30 flex items-center gap-2"
            >
              Start Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#product"
              className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl font-semibold transition-all backdrop-blur-sm"
            >
              View Demo
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-slate-400">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-slate-400">Tasks Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right - Animated Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
          >
            {/* Notification Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="absolute -top-3 -right-3 bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-teal-500/50 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              3 new
            </motion.div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Today's Tasks</h3>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>

            {/* Mock Task List */}
            <div className="space-y-3">
              {[
                { title: 'Design system review', completed: true, time: '10:00 AM' },
                { title: 'API integration', completed: false, time: '2:00 PM' },
                { title: 'User testing session', completed: false, time: '4:00 PM' },
              ].map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.2 }}
                  className="flex items-center gap-3 p-4 bg-slate-800/80 rounded-xl border border-slate-600/50 hover:border-teal-500/50 transition-all cursor-pointer group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      task.completed
                        ? 'bg-teal-500 border-teal-500'
                        : 'border-slate-600 group-hover:border-teal-500'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </motion.div>
                  <div className="flex-1">
                    <span className={`block ${task.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {task.title}
                    </span>
                    <span className="text-xs text-slate-500">{task.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-6 pt-6 border-t border-slate-800"
            >
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Daily Progress</span>
                <span className="text-teal-400 font-semibold">33%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '33%' }}
                  transition={{ delay: 2.2, duration: 1 }}
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-400"
                />
              </div>
            </motion.div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent rounded-2xl blur-xl -z-10" />
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -top-10 -right-10 w-20 h-20 bg-purple-500/20 rounded-2xl backdrop-blur-sm border border-purple-500/30"
          />
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -bottom-10 -left-10 w-24 h-24 bg-teal-500/20 rounded-2xl backdrop-blur-sm border border-teal-500/30"
          />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-teal-500 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
