'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';
import { CLOUDINARY_ASSETS } from '@/lib/cloudinary';
import { env } from '@/lib/env';

interface VideoHeroProps {
  videoPublicId?: string;
  fallbackPublicId?: string;
  children: React.ReactNode;
  overlayOpacity?: number;
  className?: string;
}

export function VideoHero({
  videoPublicId = CLOUDINARY_ASSETS.videos.hero,
  fallbackPublicId = CLOUDINARY_ASSETS.static.heroFallback,
  children,
  overlayOpacity = 0.6,
  className = '',
}: VideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  // Start with null to avoid hydration mismatch, then determine on client
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);
  // Delay showing fallback on desktop to prevent flash when video loads quickly
  const [showDelayedFallback, setShowDelayedFallback] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Disable parallax on mobile to prevent Safari scroll jank
  const shouldUseParallax = isMobile === false;
  const y = useTransform(scrollYProgress, [0, 1], ['0%', shouldUseParallax ? '30%' : '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, shouldUseParallax ? 1.1 : 1]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On desktop, delay showing fallback to give video time to load
  // On mobile, show fallback immediately
  useEffect(() => {
    if (isMobile === true) {
      // Mobile: show fallback immediately
      setShowDelayedFallback(true);
    } else if (isMobile === false && !isVideoLoaded) {
      // Desktop: wait 1.5s before showing fallback to give video time to load
      const timer = setTimeout(() => {
        if (!isVideoLoaded) {
          setShowDelayedFallback(true);
        }
      }, 1500); // Wait 1.5s before showing fallback
      return () => clearTimeout(timer);
    }
  }, [isMobile, isVideoLoaded]);

  // Determine what to show - use null check for SSR safety
  const showMobileImage = isMobile === true || hasError;
  const showDesktopVideo = isMobile === false && !hasError;
  // Only show fallback on desktop after delay (or immediately on mobile/error)
  const showLoadingFallback = showDelayedFallback && !isVideoLoaded && !showMobileImage;

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden ${className}`}
    >
      {/* Background Media */}
      <motion.div
        className="absolute inset-0 z-0"
        style={shouldUseParallax ? { y, scale } : undefined}
      >
        {/* Fallback image shown during SSR and while video loads */}
        {showLoadingFallback && (
          <div 
            className={`absolute inset-0 transition-opacity duration-700 ${
              isVideoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <CldImage
              src={fallbackPublicId}
              alt="Hero background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
              onError={() => {
                setHasError(true);
              }}
            />
          </div>
        )}

        {/* Mobile: Static Image (no parallax to prevent Safari jank) */}
        {showMobileImage && (
          <div className="absolute inset-0">
            <CldImage
              src={fallbackPublicId}
              alt="Hero background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
              onError={() => {
                setHasError(true);
              }}
            />
          </div>
        )}

        {/* Desktop: Video */}
        {showDesktopVideo && (
          <div 
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
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
              onError={() => {
                setHasError(true);
              }}
            >
              <source 
                src={`https://res.cloudinary.com/${env.cloudinaryCloudName}/video/upload/f_auto:video/${videoPublicId}.mp4`}
                type="video/mp4"
              />
              <source 
                src={`https://res.cloudinary.com/${env.cloudinaryCloudName}/video/upload/${videoPublicId}.mov`}
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
        className="relative z-20 min-h-screen flex flex-col justify-center"
        style={{ opacity }}
      >
        {children}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-white/60"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
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
