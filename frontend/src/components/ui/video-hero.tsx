'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

interface VideoHeroProps {
  videoSrc?: string;
  posterSrc?: string;
  fallbackImageSrc?: string;
  children: React.ReactNode;
  overlayOpacity?: number;
  className?: string;
}

export function VideoHero({
  videoSrc = 'https://res.cloudinary.com/demo/video/upload/v1/samples/sea-turtle',
  posterSrc,
  fallbackImageSrc = '/images/hero-fallback.jpg',
  children,
  overlayOpacity = 0.6,
  className = '',
}: VideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (videoRef.current && !isMobile) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              videoRef.current?.play();
            } else {
              videoRef.current?.pause();
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(videoRef.current);
      return () => observer.disconnect();
    }
  }, [isMobile]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden ${className}`}
    >
      {/* Background Media */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y, scale }}
      >
        {/* Mobile: Static Image */}
        {(isMobile || hasError) && (
          <div className="absolute inset-0">
            <Image
              src={fallbackImageSrc}
              alt="Hero background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
              onError={() => setHasError(true)}
            />
          </div>
        )}

        {/* Desktop: Video */}
        {!isMobile && !hasError && (
          <>
            {/* Poster/Loading state */}
            {!isVideoLoaded && posterSrc && (
              <div className="absolute inset-0">
                <Image
                  src={posterSrc}
                  alt="Loading..."
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            )}
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                isVideoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </>
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
