'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { FadeHeadline } from '@/components/ui/animated-headline';
import { ReviewCard } from '@/components/review-card';
import { fetchReviews, type ReviewsData, type Review } from '@/lib/reviews';

const FALLBACK_RATING = 4.9;
const FALLBACK_COUNT = 127;
const AUTO_ROTATE_INTERVAL = 5000;

function GoogleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function AggregateHeader({ rating, totalReviews }: { rating: number; totalReviews: number }) {
  return (
    <GlassCard className="text-center py-8 px-6 mb-10" padding="none">
      <div className="flex items-center justify-center gap-3 mb-4">
        <GoogleIcon className="w-8 h-8" />
        <span className="font-display text-5xl text-white tracking-wide">
          {rating.toFixed(1)}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1 mb-3">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} className={`w-6 h-6 ${i < Math.round(rating) ? 'text-brand-gold' : 'text-neutral-700'}`} />
        ))}
      </div>
      <p className="text-neutral-400 text-sm">
        Based on <span className="text-white font-semibold">{totalReviews}</span> Google reviews
      </p>
    </GlassCard>
  );
}

function ArrowButton({ direction, onClick, disabled }: { direction: 'left' | 'right'; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
      aria-label={direction === 'left' ? 'Previous review' : 'Next review'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {direction === 'left' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

export function ReviewsSection({ className = '' }: { className?: string }) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const xRef = useRef(0);
  const touchStartRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    fetchReviews().then(setData);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const update = () => setVisibleCount(mediaQuery.matches ? 3 : 1);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  const reviews = data?.reviews ?? [];
  const rating = data?.rating ?? FALLBACK_RATING;
  const totalReviews = data?.totalReviews ?? FALLBACK_COUNT;
  const reviewLink = data?.reviewLink ?? '';
  const maxIndex = Math.max(0, reviews.length - visibleCount);
  const activeIndex = Math.max(0, Math.min(currentIndex, maxIndex));

  useEffect(() => {
    setCurrentIndex((index) => Math.max(0, Math.min(index, maxIndex)));
  }, [maxIndex]);

  const getSlideWidth = useCallback(() => {
    if (!containerRef.current) return 0;
    const gap = 24;
    return (containerRef.current.offsetWidth + gap) / visibleCount;
  }, [visibleCount]);

  const slideTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clamped);
  }, [maxIndex]);

  useEffect(() => {
    animationRef.current?.stop();
    animationRef.current = null;
    if (!trackRef.current) return;
    const slideWidth = getSlideWidth();
    const targetX = -(activeIndex * slideWidth);
    const track = trackRef.current;

    if (prefersReducedMotion) {
      xRef.current = targetX;
      track.style.transform = `translateX(${targetX}px)`;
      return;
    }

    const animation = animate(xRef.current, targetX, {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => {
        xRef.current = value;
        if (trackRef.current === track) {
          track.style.transform = `translateX(${value}px)`;
        }
      },
    });

    animationRef.current = animation;
    return () => {
      animation.stop();
      if (animationRef.current === animation) {
        animationRef.current = null;
      }
    };
  }, [activeIndex, getSlideWidth, prefersReducedMotion, reviews.length]);

  useEffect(() => {
    if (
      isAutoplayPaused ||
      isHovered ||
      isFocused ||
      isTouching ||
      prefersReducedMotion ||
      maxIndex === 0
    ) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const index = Math.max(0, Math.min(prev, maxIndex));
        return index >= maxIndex ? 0 : index + 1;
      });
    }, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isAutoplayPaused, isHovered, isFocused, isTouching, prefersReducedMotion, maxIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    setIsTouching(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (diff > 50 && activeIndex < maxIndex) {
      slideTo(activeIndex + 1);
    } else if (diff < -50 && activeIndex > 0) {
      slideTo(activeIndex - 1);
    }
    setIsTouching(false);
  };

  if (!data?.available || reviews.length === 0) return null;

  return (
    <div className={className}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <FadeHeadline as="h2" className="font-display text-4xl sm:text-5xl text-white tracking-wide">
              Google reviews
            </FadeHeadline>
          </div>

          <AggregateHeader rating={rating} totalReviews={totalReviews} />

          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsFocused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsFocused(false);
              }
            }}
          >
            <div ref={containerRef} className="overflow-hidden">
              <div
                ref={trackRef}
                className="flex gap-6"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={() => setIsTouching(false)}
              >
                {reviews.map((review: Review) => (
                  <div
                    key={`${review.authorName}-${review.time}`}
                    className="flex-shrink-0"
                    style={{ width: `calc((100% - ${(visibleCount - 1) * 24}px) / ${visibleCount})` }}
                  >
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            </div>

            {maxIndex > 0 && !prefersReducedMotion && (
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsAutoplayPaused((paused) => !paused)}
                  aria-pressed={isAutoplayPaused}
                  className="rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/70 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-white"
                >
                  {isAutoplayPaused ? 'Resume autoplay' : 'Pause autoplay'}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-6 mt-8">
              <ArrowButton direction="left" onClick={() => slideTo(activeIndex - 1)} disabled={activeIndex === 0} />
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxIndex + 1 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => slideTo(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    aria-label={`Go to reviews page ${i + 1}`}
                    aria-current={i === activeIndex ? 'page' : undefined}
                  >
                    <span
                      className={`block h-2 rounded-full transition-all duration-300 ${
                        i === activeIndex
                          ? 'bg-red-500 w-5'
                          : 'bg-white/20 w-2'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <ArrowButton direction="right" onClick={() => slideTo(activeIndex + 1)} disabled={activeIndex >= maxIndex} />
            </div>
            <p
              className="sr-only"
              aria-live={isAutoplayPaused || isFocused || prefersReducedMotion ? 'polite' : 'off'}
            >
              Showing reviews page {activeIndex + 1} of {maxIndex + 1}
            </p>
          </div>

          {reviewLink && (
            <div className="text-center mt-10">
              <MagneticButton href={reviewLink} variant="secondary" size="md">
                Leave a review
              </MagneticButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
