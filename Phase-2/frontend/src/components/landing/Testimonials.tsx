'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    company: 'Figma',
    avatar: 'SC',
    content: 'This tool transformed how I manage my design projects. The clean interface and smart notifications keep me focused on what matters most.',
    rating: 5,
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Engineering Lead',
    company: 'Stripe',
    avatar: 'MR',
    content: 'Finally, a productivity tool that doesn\'t get in the way. The analytics help me understand my team\'s workflow patterns.',
    rating: 5,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Emily Watson',
    role: 'Founder',
    company: 'StartupCo',
    avatar: 'EW',
    content: 'The structured execution system is exactly what our fast-moving team needed. Simple, powerful, and reliable.',
    rating: 5,
    color: 'from-purple-500 to-pink-500',
  },
];

export default function Testimonials() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      
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
            <span className="text-teal-400 text-sm font-medium">💬 Customer Stories</span>
          </motion.div>
          
          <h2 className="text-5xl font-bold mb-4">
            Loved by <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Builders</span>
          </h2>
          <p className="text-xl text-slate-400">
            See what our users have to say
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -5 }}
              className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-teal-500/50 transition-all group"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 text-teal-500" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-teal-500 text-teal-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-300 leading-relaxed mb-6 relative z-10">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Hover Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-8 px-8 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl">
            <div>
              <div className="text-3xl font-bold text-teal-400">4.9/5</div>
              <div className="text-sm text-slate-400">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div>
              <div className="text-3xl font-bold text-teal-400">500+</div>
              <div className="text-sm text-slate-400">Reviews</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div>
              <div className="text-3xl font-bold text-teal-400">98%</div>
              <div className="text-sm text-slate-400">Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
