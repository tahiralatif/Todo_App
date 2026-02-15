'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Filter, Trash2, Bell, User, Calendar, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'JWT-based authentication with industry-standard security practices and encrypted data storage.',
    color: 'from-blue-500 to-cyan-500',
    badge: undefined,
  },
  {
    icon: Zap,
    title: 'Smart Task Creation',
    description: 'Create tasks with priorities, due dates, and rich descriptions. Never miss a deadline.',
    color: 'from-teal-500 to-green-500',
    badge: undefined,
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Get browser notifications 15 minutes before tasks are due - even when app is closed!',
    color: 'from-yellow-500 to-orange-500',
    badge: 'New',
  },
  {
    icon: Filter,
    title: 'Advanced Filtering',
    description: 'Filter by status, priority, and date. Search and organize tasks efficiently.',
    color: 'from-purple-500 to-pink-500',
    badge: undefined,
  },
  {
    icon: Trash2,
    title: 'Soft Delete & Restore',
    description: 'Never lose data. Restore deleted tasks with a single click and maintain full history.',
    color: 'from-orange-500 to-red-500',
    badge: undefined,
  },
  {
    icon: BarChart3,
    title: 'Productivity Analytics',
    description: 'Beautiful charts showing completion rates, trends, and performance metrics.',
    color: 'from-green-500 to-teal-500',
    badge: undefined,
  },
  {
    icon: User,
    title: 'Profile Management',
    description: 'Complete profile customization with photo uploads to cloud storage and preferences.',
    color: 'from-indigo-500 to-purple-500',
    badge: undefined,
  },
  {
    icon: Calendar,
    title: 'Due Date Tracking',
    description: 'Set due dates with time, see countdown timers, and track overdue tasks automatically.',
    color: 'from-pink-500 to-rose-500',
    badge: undefined,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-950/5 to-transparent" />
      
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
            <span className="text-teal-400 text-sm font-medium">✨ Production-Ready Features</span>
          </motion.div>
          
          <h2 className="text-5xl font-bold mb-4">
            Built for <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Performance</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Every feature is backed by robust APIs and designed for scale
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/50 transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className="relative z-10 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                {/* New Badge */}
                {feature.badge && (
                  <div className="absolute -top-2 -right-2">
                    <span className="px-2 py-1 bg-gradient-to-r from-teal-500 to-green-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                      {feature.badge}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-teal-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-500/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-400 mb-4">Want to see more?</p>
          <a
            href="#product"
            className="inline-block px-8 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl font-semibold transition-all backdrop-blur-sm hover:border-teal-500/50"
          >
            Explore Product Demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
