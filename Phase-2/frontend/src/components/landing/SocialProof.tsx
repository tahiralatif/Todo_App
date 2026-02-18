'use client';

import { motion } from 'framer-motion';

export default function SocialProof() {
  const logos = [
    { name: 'Vercel', color: 'from-white to-slate-300' },
    { name: 'GitHub', color: 'from-purple-400 to-pink-400' },
    { name: 'Linear', color: 'from-blue-400 to-cyan-400' },
    { name: 'Notion', color: 'from-slate-300 to-slate-400' },
    { name: 'Stripe', color: 'from-purple-400 to-blue-400' },
    { name: 'Figma', color: 'from-pink-400 to-orange-400' },
  ];

  return (
    <section className="py-20 border-y border-slate-800/50 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-purple-500/5" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
            Trusted by 10,000+ builders worldwide
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </motion.div>
              ))}
            </div>
            <span className="text-slate-500 text-sm ml-2">and thousands more</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.1, opacity: 1 }}
              className="group relative"
            >
              <div className="text-center">
                <div className={`text-2xl font-bold bg-gradient-to-r ${logo.color} bg-clip-text text-transparent opacity-40 group-hover:opacity-100 transition-all duration-300`}>
                  {logo.name}
                </div>
                {/* Glow Effect on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${logo.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-slate-800/50"
        >
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '50K+', label: 'Tasks Completed' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
