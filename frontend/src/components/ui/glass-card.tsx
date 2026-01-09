'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useRef, MouseEvent } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  spotlight?: boolean;
  gradient?: 'none' | 'subtle' | 'red';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  hover = true,
  spotlight = true,
  gradient = 'none',
  padding = 'md',
  onClick,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !spotlight) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6 lg:p-8',
    lg: 'p-8 lg:p-10',
  };

  const gradientClasses = {
    none: '',
    subtle: 'bg-gradient-to-br from-white/[0.03] to-transparent',
    red: 'bg-gradient-to-br from-red-600/10 to-transparent',
  };

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative overflow-hidden rounded-2xl
        glass-card
        ${hover ? 'glass-card-hover shine-effect' : ''}
        ${paddingClasses[padding]}
        ${gradientClasses[gradient]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* Spotlight effect following cursor */}
      {spotlight && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                350px circle at ${mouseX}px ${mouseY}px,
                rgba(239, 68, 68, 0.08),
                transparent 80%
              )
            `,
          }}
        />
      )}

      {/* Top highlight line */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Feature card with icon
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  className = '',
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className={`h-full ${className}`} hover gradient="subtle">
        <div className="flex flex-col h-full">
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-5 shadow-lg shadow-red-600/20">
            <div className="text-white">{icon}</div>
          </div>

          {/* Content */}
          <h3 className="font-display text-2xl text-white mb-3 tracking-wide">
            {title}
          </h3>
          <p className="text-neutral-400 leading-relaxed flex-grow">
            {description}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// Stats card
interface StatsCardProps {
  value: string;
  label: string;
  className?: string;
}

export function StatsCard({ value, label, className = '' }: StatsCardProps) {
  return (
    <GlassCard className={`text-center ${className}`} padding="lg">
      <div className="font-display text-5xl lg:text-6xl text-gradient-red mb-2">
        {value}
      </div>
      <div className="text-neutral-400 text-sm uppercase tracking-wider">
        {label}
      </div>
    </GlassCard>
  );
}
