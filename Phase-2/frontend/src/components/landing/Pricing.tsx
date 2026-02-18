'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for getting started',
    icon: Zap,
    features: [
      'Up to 50 tasks',
      'Basic notifications',
      'Task filtering',
      'Mobile app access',
      'Email support',
      '1 GB storage',
    ],
    cta: 'Start Free',
    highlighted: false,
    popular: false,
  },
  {
    name: 'Pro',
    price: { monthly: 12, yearly: 120 },
    description: 'For serious productivity',
    icon: Sparkles,
    features: [
      'Unlimited tasks',
      'Advanced analytics',
      'Priority notifications',
      'Calendar integration',
      'Custom workflows',
      'Priority support',
      'Export data',
      'Team collaboration',
      '50 GB storage',
      'API access',
    ],
    cta: 'Get Started',
    highlighted: true,
    popular: true,
  },
  {
    name: 'Team',
    price: { monthly: 29, yearly: 290 },
    description: 'For growing teams',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Admin controls',
      'Advanced permissions',
      'Dedicated support',
      'Custom integrations',
      'SSO authentication',
      'Unlimited storage',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
    popular: false,
    comingSoon: false,
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
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
            <span className="text-teal-400 text-sm font-medium">💎 Simple Pricing</span>
          </motion.div>
          
          <h2 className="text-5xl font-bold mb-4">
            Choose Your <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Plan</span>
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Start free, upgrade when you need more power
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-900/80 border border-slate-700/50 rounded-full p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full transition-all ${
                !isYearly ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
                isYearly ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-teal-500/10 to-slate-900/80 border-2 border-teal-500 shadow-2xl shadow-teal-500/20 lg:scale-105'
                  : 'bg-slate-900/80 border border-slate-700/50 hover:border-slate-600'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg shadow-teal-500/50">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/50' 
                  : 'bg-slate-800'
              }`}>
                <plan.icon className="w-7 h-7 text-white" />
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                
                <div className="mb-2">
                  <span className="text-5xl font-bold">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-slate-400">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                
                {isYearly && plan.price.monthly > 0 && (
                  <p className="text-sm text-slate-400">
                    ${(plan.price.yearly / 12).toFixed(2)}/month billed annually
                  </p>
                )}
              </div>

              <Link
                href={plan.comingSoon ? '#' : '/signup'}
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-all mb-8 ${
                  plan.highlighted
                    ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/30'
                    : plan.comingSoon
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? 'bg-teal-500/20' : 'bg-slate-800'
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? 'text-teal-400' : 'text-slate-400'}`} />
                    </div>
                    <span className="text-slate-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Glow Effect */}
              {plan.highlighted && (
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent rounded-2xl -z-10 blur-xl" />
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-400 mb-4">Have questions about pricing?</p>
          <a
            href="#faq"
            className="inline-block px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl font-semibold transition-all backdrop-blur-sm hover:border-teal-500/50"
          >
            View FAQ
          </a>
        </motion.div>
      </div>
    </section>
  );
}
