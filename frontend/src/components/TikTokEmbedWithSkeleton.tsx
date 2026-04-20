"use client";

import { useEffect, useRef, useState } from "react";
import { SocialEmbedCard } from "./social-embed-card";

interface TikTokEmbedWithSkeletonProps {
  className?: string;
}

export default function TikTokEmbedWithSkeleton({ className }: TikTokEmbedWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded) {
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      script.onload = () => setLoaded(true);
      if (embedRef.current) {
        embedRef.current.appendChild(script);
      }
    }
  }, [loaded]);

  return (
    <SocialEmbedCard
      platform="tiktok"
      handle="@quikspitboise"
      loading={!loaded}
      className={className}
    >
      <div ref={embedRef} className="w-full">
        <blockquote
          className="tiktok-embed"
          cite="https://www.tiktok.com/@quikspitboise"
          data-unique-id="quikspitboise"
          data-embed-type="creator"
          style={{ maxWidth: "100%", minWidth: 0, width: "100%", margin: "0 auto" }}
        >
          <section>
            <a target="_blank" href="https://www.tiktok.com/@quikspitboise?refer=creator_embed">@quikspitboise</a>
          </section>
        </blockquote>
      </div>
    </SocialEmbedCard>
  );
}
