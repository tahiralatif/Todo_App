'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';

interface MainCanvasProps {
  children: React.ReactNode;
  className?: string;
}

const MainCanvas: React.FC<MainCanvasProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <GlassCard className="w-full min-h-[calc(100vh-4rem)] backdrop-blur-xl border border-white/20 shadow-2xl">
          {children}
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default MainCanvas;