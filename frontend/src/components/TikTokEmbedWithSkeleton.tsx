"use client";

import { useEffect, useRef, useState } from "react";
import { SocialEmbedCard } from "./social-embed-card";

interface TikTokEmbedWithSkeletonProps {
  className?: string;
}

/**
 * Loads the TikTok embed script only once the card is close to the
 * viewport, so the third-party JS and iframe stay off the critical path.
 */
export default function TikTokEmbedWithSkeleton({ className }: TikTokEmbedWithSkeletonProps) {
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
    document.querySelector('script[data-quikspit-tiktok-embed]')?.remove();
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    script.dataset.quikspitTiktokEmbed = "true";
    script.onload = () => setScriptLoaded(true);
    embedRef.current?.appendChild(script);
    return () => {
      script.parentNode?.removeChild(script);
    };
  }, [inView]);

  return (
    <SocialEmbedCard
      platform="tiktok"
      handle="@quikspitboise"
      loading={!inView || !scriptLoaded}
      className={className}
    >
      <div ref={embedRef} className="w-full">
        {inView && (
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
      </div>
    </SocialEmbedCard>
  );
}
