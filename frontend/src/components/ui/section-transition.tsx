'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface SectionTransitionProps {
  className?: string;
  variant?: 'line' | 'fade' | 'dots';
}

export function SectionTransition({
  className = '',
  variant = 'line',
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  if (variant === 'line') {
    return (
      <div ref={ref} className={`py-12 lg:py-16 ${className}`}>
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    );
  }

  if (variant === 'fade') {
    return (
      <div ref={ref} className={`py-16 lg:py-24 ${className}`}>
        <motion.div
          className="h-32 bg-gradient-to-b from-transparent via-red-600/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div ref={ref} className={`py-12 lg:py-16 flex justify-center gap-3 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-red-600/50"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    );
  }

  return null;
}

// Animated section wrapper
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  id,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.section>
  );
}
