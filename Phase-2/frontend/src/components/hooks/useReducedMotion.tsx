import { useState, useEffect } from 'react';

export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      // Set initial value
      setReducedMotion(mediaQuery.matches);

      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
      };

      // Add listener
      mediaQuery.addEventListener('change', handleChange);

      // Cleanup
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  return reducedMotion;
};

// Component wrapper that respects reduced motion preferences
interface MotionWrapperProps {
  children: React.ReactNode;
  reducedMotionChildren?: React.ReactNode;
  animate: boolean;
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  reducedMotionChildren,
  animate
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion || !animate) {
    return reducedMotionChildren || <>{children}</>;
  }

  return <>{children}</>;
};