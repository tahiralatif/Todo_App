'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: 'How does the free plan work?',
    answer: 'Our free plan includes up to 50 tasks, basic notifications, task filtering, and profile management. Perfect for individuals getting started with productivity management. No credit card required.',
  },
  {
    question: 'What features are currently available?',
    answer: 'We offer secure JWT authentication, task management (create, update, delete, restore), real-time notifications, advanced filtering, soft delete with restore, profile management with photo uploads to cloud storage, and productivity analytics.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes! We use JWT-based authentication with secure password hashing (bcrypt). All data is stored in PostgreSQL database with proper user isolation - you can only access your own data.',
  },
  {
    question: 'Can I restore deleted tasks?',
    answer: 'Absolutely! We use soft delete, which means deleted tasks are not permanently removed. You can restore any deleted task with a single click from your task list.',
  },
  {
    question: 'How do notifications work?',
    answer: 'You receive real-time notifications for all task activities including task creation, updates, completion, and deletion. Notifications are stored in the database and you can mark them as read or delete them.',
  },
  {
    question: 'Can I upload a profile photo?',
    answer: 'Yes! You can upload profile photos (JPG, PNG, WebP, GIF up to 5MB). Photos are stored in Supabase cloud storage and you get a public CDN URL for fast access.',
  },
  {
    question: 'What profile information can I manage?',
    answer: 'You can manage your name, first name, last name, email, phone number, date of birth, gender, address, city, country, bio, and profile photo. All fields are optional except name.',
  },
  {
    question: 'How many tasks can I create?',
    answer: 'Currently, there is no limit on the number of tasks you can create. You can organize them with filters, search by status (pending, completed, deleted), and use pagination for better performance.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
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
            <span className="text-teal-400 text-sm font-medium">❓ Got Questions?</span>
          </motion.div>
          
          <h2 className="text-5xl font-bold mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-slate-400">
            Everything you need to know about Execute
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-teal-500/50 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold text-white pr-8">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center transition-all ${
                  openIndex === index ? 'rotate-180 bg-teal-500' : ''
                }`}>
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-teal-400" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-8 bg-slate-900/80 border border-slate-700/50 rounded-2xl">
            <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
            <p className="text-slate-400 mb-6">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-teal-500/30"
            >
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
