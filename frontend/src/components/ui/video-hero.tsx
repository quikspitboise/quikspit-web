'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { CLOUDINARY_ASSETS } from '@/lib/cloudinary';

interface VideoHeroProps {
  videoPublicId?: string;
  fallbackPublicId?: string;
  children: React.ReactNode;
  className?: string;
}

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export function VideoHero({
  videoPublicId = CLOUDINARY_ASSETS.videos.hero,
  fallbackPublicId = CLOUDINARY_ASSETS.static.heroFallback,
  children,
  className = '',
}: VideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  // Media drifts slower than the page. Transform-only, so it stays on the
  // compositor; skipped on touch/small screens where Safari tends to jank.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const update = () => {
      const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
      setShouldLoadVideo(desktopQuery.matches && !motionQuery.matches && !saveData);
    };
    update();
    motionQuery.addEventListener('change', update);
    desktopQuery.addEventListener('change', update);
    return () => {
      motionQuery.removeEventListener('change', update);
      desktopQuery.removeEventListener('change', update);
    };
  }, []);

  const showVideo = shouldLoadVideo && !hasError;
  const useParallax = showVideo && prefersReducedMotion === false;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return (
    <div
      ref={containerRef}
      // 100svh keeps the hero steady while iOS Safari's toolbar shows/hides;
      // min-h-screen is the fallback.
      className={`relative isolate min-h-screen supports-[min-height:100svh]:min-h-[calc(100svh-var(--nav-total-height))] overflow-hidden ${className}`}
    >
      <motion.div
        className="absolute inset-0 -z-10 will-change-transform"
        style={useParallax ? { y } : undefined}
      >
        <CldImage
          src={fallbackPublicId}
          alt="Hero background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          version="1768175039"
        />

        {showVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onPlaying={() => setIsVideoLoaded(true)}
            onError={() => setHasError(true)}
          >
            <source
              src={`https://res.cloudinary.com/${cloudName}/video/upload/f_auto:video,q_auto/${videoPublicId}.mp4`}
              type="video/mp4"
            />
            <source
              src={`https://res.cloudinary.com/${cloudName}/video/upload/${videoPublicId}.mov`}
              type="video/quicktime"
            />
          </video>
        )}
      </motion.div>

      <div className="absolute inset-0 -z-10 hero-overlay" aria-hidden="true" />

      <div className="relative flex min-h-[inherit] flex-col justify-end">
        {children}
      </div>
    </div>
  );
}
