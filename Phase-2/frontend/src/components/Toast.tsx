'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const styles = {
    success: {
      bg: 'bg-slate-900/95',
      border: 'border-teal-500/50',
      icon: 'text-teal-400',
      text: 'text-white'
    },
    error: {
      bg: 'bg-slate-900/95',
      border: 'border-red-500/50',
      icon: 'text-red-400',
      text: 'text-white'
    },
    info: {
      bg: 'bg-slate-900/95',
      border: 'border-blue-500/50',
      icon: 'text-blue-400',
      text: 'text-white'
    },
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${style.bg} ${style.border} max-w-sm`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${style.icon}`} />
      <p className={`text-sm font-medium ${style.text}`}>{message}</p>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity text-slate-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
