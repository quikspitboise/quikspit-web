'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { CLOUDINARY_ASSETS } from '@/lib/cloudinary';

interface VideoHeroProps {
  videoPublicId?: string;
  fallbackPublicId?: string;
  children: React.ReactNode;
  overlayOpacity?: number;
  className?: string;
}

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export function VideoHero({
  videoPublicId = CLOUDINARY_ASSETS.videos.hero,
  fallbackPublicId = CLOUDINARY_ASSETS.static.heroFallback,
  children,
  overlayOpacity = 0.6,
  className = '',
}: VideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const canAnimate = prefersReducedMotion === false;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Disable parallax on mobile to prevent Safari scroll jank
  const shouldUseParallax = canAnimate && !isMobile;
  const y = useTransform(scrollYProgress, [0, 1], ['0%', shouldUseParallax ? '30%' : '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, shouldUseParallax ? 1.1 : 1]);

  useEffect(() => {
    const updateEnvironment = () => {
      const mobile = window.innerWidth < 768;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
      setIsMobile(mobile);
      setShouldLoadVideo(!mobile && !reducedMotion && !saveData);
    };
    updateEnvironment();
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.addEventListener('resize', updateEnvironment);
    motionQuery.addEventListener('change', updateEnvironment);
    return () => {
      window.removeEventListener('resize', updateEnvironment);
      motionQuery.removeEventListener('change', updateEnvironment);
    };
  }, []);

  const showDesktopVideo = shouldLoadVideo && !hasError;

  return (
    <div
      ref={containerRef}
      // min-h-screen is the fallback; 100dvh tracks the visible viewport on
      // iOS Safari as its toolbar shows/hides, keeping the hero exactly
      // viewport-sized below the fixed header.
      className={`relative min-h-screen supports-[min-height:100dvh]:min-h-[100dvh] overflow-hidden ${className}`}
    >
      {/* Background Media */}
      <motion.div
        className="absolute inset-0 z-0"
        style={shouldUseParallax ? { y, scale } : undefined}
      >
        {/* The poster is rendered on the server and remains behind optional video. */}
        <div className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-700 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}>
          <CldImage
            src={fallbackPublicId}
            alt="Hero background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            version="1768175039"
          />
        </div>

        {/* Desktop: Video */}
        {showDesktopVideo && (
          <div
            className={`absolute inset-0 w-full h-full motion-safe:transition-opacity motion-safe:duration-700 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="w-full h-full object-cover"
              onPlay={() => {
                setIsVideoLoaded(true);
              }}
              onLoadedData={() => {
                setIsVideoLoaded(true);
              }}
              onCanPlay={() => {
                setIsVideoLoaded(true);
              }}
              onError={(e) => {
                console.error('Video error:', e);
                setHasError(true);
              }}
            >
              <source 
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/f_auto:video/${videoPublicId}.mp4`}
                type="video/mp4"
              />
              <source 
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${videoPublicId}.mov`}
                type="video/quicktime"
              />
            </video>
          </div>
        )}
      </motion.div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-10 hero-overlay"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(10, 10, 10, ${overlayOpacity * 0.5}) 0%,
            rgba(10, 10, 10, ${overlayOpacity * 0.7}) 50%,
            rgba(10, 10, 10, 0.98) 100%
          )`,
        }}
      />

      {/* Vignette Effect */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 10, 0.4) 100%)',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-20 min-h-screen supports-[min-height:100dvh]:min-h-[100dvh] flex flex-col justify-center"
        style={canAnimate ? { opacity } : undefined}
      >
        {children}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={canAnimate ? { opacity: 0, y: -10 } : false}
        animate={canAnimate ? { opacity: 1, y: 0 } : undefined}
        transition={canAnimate ? { delay: 1.5, duration: 0.6 } : undefined}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-white/60"
          animate={canAnimate ? { y: [0, 8, 0] } : undefined}
          transition={canAnimate ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
