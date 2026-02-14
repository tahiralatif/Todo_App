'use client';

import { motion } from 'framer-motion';
import { Target, Zap, TrendingUp, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Plan',
    description: 'Create and organize tasks with smart categorization. Set priorities, deadlines, and break down complex projects into manageable steps.',
    icon: Target,
    color: 'teal',
  },
  {
    number: '02',
    title: 'Execute',
    description: 'Focus on what matters. Track progress in real-time, receive smart notifications, and toggle task completion with a single click.',
    icon: Zap,
    color: 'teal',
  },
  {
    number: '03',
    title: 'Track',
    description: 'Monitor your productivity with detailed analytics. View completion rates, weekly trends, and identify patterns to optimize your workflow.',
    icon: TrendingUp,
    color: 'gold',
  },
];

export default function Workflow() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full"
          >
            <span className="text-teal-400 text-sm font-medium">⚡ Simple Process</span>
          </motion.div>
          
          <h2 className="text-5xl font-bold mb-4">
            Your <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Workflow</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Three steps to structured execution and peak productivity
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
          
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -10 }}
                className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 h-full hover:border-teal-500/50 transition-all group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/50">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                  step.color === 'gold' 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                    : 'bg-gradient-to-br from-teal-500/20 to-teal-600/20 border border-teal-500/30'
                } group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-8 h-8 ${
                    step.color === 'gold' ? 'text-yellow-400' : 'text-teal-400'
                  }`} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  {step.title}
                  {i < steps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Accent Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl ${
                  step.color === 'gold'
                    ? 'bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-teal-500/50 to-transparent'
                } opacity-0 group-hover:opacity-100 transition-opacity`} />

                {/* Glow Effect */}
                <div className={`absolute inset-0 ${
                  step.color === 'gold'
                    ? 'bg-gradient-to-br from-yellow-500/5 to-transparent'
                    : 'bg-gradient-to-br from-teal-500/5 to-transparent'
                } rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
              </motion.div>

              {/* Connection Arrow (Mobile) */}
              {i < steps.length - 1 && (
                <div className="lg:hidden flex justify-center my-4">
                  <ArrowRight className="w-6 h-6 text-teal-500 rotate-90" />
                </div>
              )}
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
          <p className="text-slate-400 mb-6">
            Ready to streamline your workflow?
          </p>
          <motion.a
            href="/signup"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all"
          >
            Start Free Today
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
