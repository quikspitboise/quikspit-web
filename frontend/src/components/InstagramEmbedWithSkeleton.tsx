"use client";

import { useEffect, useRef, useState } from "react";
import { SocialEmbedCard } from "./social-embed-card";
import { loadProviderScript } from "@/lib/provider-script";

declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

interface InstagramEmbedWithSkeletonProps {
  className?: string;
}

/**
 * Loads the Instagram embed script only once the card is close to the
 * viewport, so the third-party JS and iframe stay off the critical path.
 */
export default function InstagramEmbedWithSkeleton({ className }: InstagramEmbedWithSkeletonProps) {
  const [inView, setInView] = useState(false);
  const [scriptState, setScriptState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = embedRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    setScriptState('loading');

    loadProviderScript('instagram')
      .then(() => {
        if (cancelled) return;
        try {
          const processEmbeds = window.instgrm?.Embeds.process;
          if (typeof processEmbeds !== 'function') throw new Error('Instagram embed API unavailable.');
          processEmbeds();
          setScriptState('loaded');
        } catch {
          setScriptState('error');
        }
      })
      .catch(() => {
        if (!cancelled) setScriptState('error');
      });

    return () => { cancelled = true; };
  }, [inView]);

  return (
    <SocialEmbedCard
      platform="instagram"
      handle="@quikspitboise"
      loading={!inView || scriptState === 'loading'}
      className={className}
    >
      <div ref={embedRef} className="w-full">
        {inView && scriptState === 'loaded' && (
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/quikspitboise/?utm_source=ig_embed&amp;utm_campaign=loading"
            data-instgrm-version="14"
            style={{ background: "#FFF", border: 0, borderRadius: "8px", boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)", margin: "0 auto", maxWidth: "100%", minWidth: 0, padding: 0, width: "100%" }}
          />
        )}
        {inView && scriptState === 'error' && (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 px-6 text-center" role="status">
            <p className="text-sm text-neutral-300">Instagram is unavailable right now.</p>
            <a
              href="https://www.instagram.com/quikspitboise/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-400 underline underline-offset-4 hover:text-red-300"
            >
              Open Instagram
            </a>
          </div>
        )}
      </div>
    </SocialEmbedCard>
  );
}
