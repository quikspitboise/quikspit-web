"use client";

import { useEffect, useRef, useState } from "react";
import { SocialEmbedCard } from "./social-embed-card";

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
  const [scriptLoaded, setScriptLoaded] = useState(false);
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
    document.querySelector('script[data-quikspit-instagram-embed]')?.remove();
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.dataset.quikspitInstagramEmbed = "true";
    script.onload = () => {
      setScriptLoaded(true);
      window.instgrm?.Embeds.process();
    };
    embedRef.current?.appendChild(script);
    return () => {
      script.parentNode?.removeChild(script);
    };
  }, [inView]);

  return (
    <SocialEmbedCard
      platform="instagram"
      handle="@quikspitboise"
      loading={!inView || !scriptLoaded}
      className={className}
    >
      <div ref={embedRef} className="w-full">
        {inView && (
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/quikspitboise/?utm_source=ig_embed&amp;utm_campaign=loading"
            data-instgrm-version="14"
            style={{ background: "#FFF", border: 0, borderRadius: "8px", boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)", margin: "0 auto", maxWidth: "100%", minWidth: 0, padding: 0, width: "100%" }}
          />
        )}
      </div>
    </SocialEmbedCard>
  );
}
