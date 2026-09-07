"use client";

import { useEffect, useRef, useState } from "react";
import { SocialEmbedCard } from "./social-embed-card";
import { loadProviderScript } from "@/lib/provider-script";

interface TikTokEmbedWithSkeletonProps {
  className?: string;
}

/**
 * Loads the TikTok embed script only once the card is close to the
 * viewport, so the third-party JS and iframe stay off the critical path.
 */
export default function TikTokEmbedWithSkeleton({ className }: TikTokEmbedWithSkeletonProps) {
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

    loadProviderScript('tiktok')
      .then(() => {
        if (!cancelled) setScriptState('loaded');
      })
      .catch(() => {
        if (!cancelled) setScriptState('error');
      });

    return () => { cancelled = true; };
  }, [inView]);

  return (
    <SocialEmbedCard
      platform="tiktok"
      handle="@quikspitboise"
      loading={!inView || scriptState === 'loading'}
      className={className}
    >
      <div ref={embedRef} className="w-full">
        {inView && scriptState === 'loaded' && (
          <blockquote
            className="tiktok-embed"
            cite="https://www.tiktok.com/@quikspitboise"
            data-unique-id="quikspitboise"
            data-embed-type="creator"
            style={{ maxWidth: "100%", minWidth: 0, width: "100%", margin: "0 auto" }}
          >
            <section>
              <a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@quikspitboise?refer=creator_embed">@quikspitboise</a>
            </section>
          </blockquote>
        )}
        {inView && scriptState === 'error' && (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 px-6 text-center" role="status">
            <p className="text-sm text-neutral-300">TikTok is unavailable right now.</p>
            <a
              href="https://www.tiktok.com/@quikspitboise"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-400 underline underline-offset-4 hover:text-red-300"
            >
              Open TikTok
            </a>
          </div>
        )}
      </div>
    </SocialEmbedCard>
  );
}
