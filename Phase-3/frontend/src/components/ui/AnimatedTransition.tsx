'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'bounce';
  delay?: number;
  duration?: number;
  className?: string;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  type = 'fade',
  delay = 0,
  duration = 0.5,
  className,
}) => {
  const variants = {
    hidden: {
      opacity: 0,
      ...(type === 'slide' && { x: 20 }),
      ...(type === 'scale' && { scale: 0.95 }),
      ...(type === 'bounce' && { y: 20, rotateX: -90 }),
    },
    visible: {
      opacity: 1,
      transition: { delay, duration },
      ...(type === 'slide' && { x: 0 }),
      ...(type === 'scale' && { scale: 1 }),
      ...(type === 'bounce' && { y: 0, rotateX: 0 }),
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTransition;