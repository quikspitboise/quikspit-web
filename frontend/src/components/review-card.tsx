'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import type { Review } from '@/lib/reviews';

const MAX_CHARS = 150;

function StarIcon({ filled, className = '' }: { filled: boolean; className?: string }) {
  return (
    <svg className={`w-4 h-4 ${filled ? 'text-brand-gold' : 'text-neutral-700'} ${className}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function GoogleBadge() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isTruncatable = review.text.length > MAX_CHARS;

  return (
    <GlassCard className="h-full flex flex-col" hover={!prefersReducedMotion} padding="md">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <img
            src={review.profilePhotoUrl}
            alt={review.authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
            loading="lazy"
          />
          <div className="absolute -bottom-1 -right-1">
            <GoogleBadge />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{review.authorName}</p>
          <p className="text-neutral-500 text-xs">{review.relativeTimeDescription}</p>
        </div>
      </div>

      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} filled={i < review.rating} />
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={expanded ? 'expanded' : 'collapsed'}
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-neutral-300 text-sm leading-relaxed">
              {expanded || !isTruncatable
                ? review.text
                : review.text.slice(0, MAX_CHARS) + '...'}
            </p>
          </motion.div>
        </AnimatePresence>

        {isTruncatable && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-red-400 hover:text-red-300 text-sm font-medium mt-2 px-1 py-1.5 -ml-1 transition-colors"
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
    </GlassCard>
  );
}
