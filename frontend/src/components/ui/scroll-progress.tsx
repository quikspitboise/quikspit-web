'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollProgressProps {
  className?: string;
  color?: string;
}

export function ScrollProgress({
  className = '',
  color = 'bg-gradient-to-r from-red-600 to-red-500',
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-[3px] origin-left z-[9999] ${color} ${className}`}
      style={{ scaleX }}
    />
  );
}

// Hook for scroll-linked animations
export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
}
