'use client';

import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { useRef, useMemo } from 'react';

interface AnimatedHeadlineProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  delay?: number;
  splitBy?: 'word' | 'character';
  once?: boolean;
}

function getContainerVariants(delay: number): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    rotateX: -40,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  },
};

export function AnimatedHeadline({
  text,
  className = '',
  as: Component = 'h1',
  delay = 0,
  splitBy = 'word',
  once = true,
}: AnimatedHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  const items = useMemo(() => {
    if (splitBy === 'character') {
      return text.split('').map((char, i) => ({
        char: char === ' ' ? '\u00A0' : char,
        key: `${char}-${i}`,
      }));
    }
    return text.split(' ').map((word, i) => ({
      char: word,
      key: `${word}-${i}`,
    }));
  }, [text, splitBy]);

  const baseClasses = `font-display uppercase tracking-wide ${className}`;

  if (prefersReducedMotion) {
    return <Component className={baseClasses}>{text}</Component>;
  }

  return (
    <motion.div
      ref={ref}
      variants={getContainerVariants(delay)}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      style={{ perspective: 1000 }}
    >
      <Component className={baseClasses}>
        {items.map(({ char, key }) => (
          <motion.span
            key={key}
            variants={itemVariants}
            className="inline-block"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {char}
            {splitBy === 'word' && <span>&nbsp;</span>}
          </motion.span>
        ))}
      </Component>
    </motion.div>
  );
}

// Simpler fade-up headline for secondary headings
interface FadeHeadlineProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  delay?: number;
}

export function FadeHeadline({
  children,
  className = '',
  as: Component = 'h2',
  delay = 0,
}: FadeHeadlineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Component className={className}>{children}</Component>
    </motion.div>
  );
}
