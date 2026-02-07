import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  key?: string;
  type?: 'fade' | 'slide' | 'zoom';
}

export const PageTransition = ({ children, key, type = 'fade' }: PageTransitionProps) => {
  const variants = {
    hidden: {
      opacity: 0,
      ...(type === 'slide' && { x: 20 }),
      ...(type === 'zoom' && { scale: 0.95 }),
    },
    enter: {
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
      ...(type === 'slide' && { x: 0 }),
      ...(type === 'zoom' && { scale: 1 }),
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' },
      ...(type === 'slide' && { x: -20 }),
      ...(type === 'zoom' && { scale: 0.95 }),
    },
  };

  return (
    <motion.div
      key={key}
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export const PageTransitionWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
};