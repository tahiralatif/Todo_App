'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinnerSize = {
    sm: 2,
    md: 3,
    lg: 4,
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className={`${sizeClasses[size]} border-current border-t-transparent rounded-full`}
        style={{
          borderWidth: spinnerSize[size],
        }}
      />
      {label && (
        <span className="mt-2 text-sm text-gray-400">{label}</span>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  overlayLabel?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  overlayLabel = 'Loading...'
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <GlassCard className="p-8 flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <span className="mt-4 text-lg font-medium">{overlayLabel}</span>
        </GlassCard>
      </div>
    </div>
  );
};

export default LoadingSpinner;