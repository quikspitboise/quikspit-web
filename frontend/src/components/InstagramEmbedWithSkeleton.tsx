"use client";

import { useEffect, useRef, useState } from "react";
import { SocialEmbedCard } from "./social-embed-card";

interface InstagramEmbedWithSkeletonProps {
  className?: string;
}

export default function InstagramEmbedWithSkeleton({ className }: InstagramEmbedWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevScript = document.querySelector('script[src="//www.instagram.com/embed.js"]');
    if (prevScript) {
      prevScript.remove();
    }
    setLoaded(false);
    const script = document.createElement("script");
    script.src = "//www.instagram.com/embed.js";
    script.async = true;
    if (embedRef.current) {
      embedRef.current.appendChild(script);
    }
    script.onload = () => {
      setLoaded(true);
      // @ts-expect-error: Instagram embed script attaches instgrm to window
      if (window.instgrm) {
        // @ts-expect-error: Instagram embed script attaches instgrm to window
        window.instgrm.Embeds.process();
      }
    };
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <SocialEmbedCard
      platform="instagram"
      handle="@quikspitboise"
      loading={!loaded}
      className={className}
    >
      <div ref={embedRef} className="w-full">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink="https://www.instagram.com/quikspitboise/?utm_source=ig_embed&amp;utm_campaign=loading"
          data-instgrm-version="14"
          style={{ background: "#FFF", border: 0, borderRadius: "8px", boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)", margin: "0 auto", maxWidth: "100%", minWidth: 0, padding: 0, width: "100%" }}
        />
      </div>
    </SocialEmbedCard>
  );
}
