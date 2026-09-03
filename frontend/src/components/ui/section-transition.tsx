'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

/**
 * Thin hairline divider between sections. Static by design: sections carry
 * their own vertical padding, so the divider adds no extra rhythm.
 */
export function SectionTransition({ className = '' }: { className?: string }) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`} aria-hidden="true">
      <div className="h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
    </div>
  );
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
  const prefersReducedMotion = useReducedMotion();

  const hidden = { opacity: 0, y: 40 };
  const visible = { opacity: 1, y: 0 };

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={prefersReducedMotion ? false : hidden}
      animate={prefersReducedMotion ? undefined : isInView ? visible : hidden}
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
