"use client";

import { useEffect, useRef, useState } from "react";

interface InstagramEmbedWithSkeletonProps {
  className?: string;
}

export default function InstagramEmbedWithSkeleton({ className }: InstagramEmbedWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove any previous Instagram embed script
    const prevScript = document.querySelector('script[src="//www.instagram.com/embed.js"]');
    if (prevScript) {
      prevScript.remove();
    }
    setLoaded(false);
    // Add new script and re-initialize embed
    const script = document.createElement("script");
    script.src = "//www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    if (embedRef.current) {
      embedRef.current.appendChild(script);
    }
    // Instagram requires window.instgrm to reprocess embeds
    script.onload = () => {
      setLoaded(true);
      // @ts-expect-error: Instagram embed script attaches instgrm to window
      if (window.instgrm) {
        // @ts-expect-error: Instagram embed script attaches instgrm to window
        window.instgrm.Embeds.process();
      }
    };
    // Clean up script on unmount
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div className={`relative w-full min-h-[360px] overflow-hidden rounded-lg ${className ?? ''}`}> 
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-800 rounded-xl border border-neutral-600 animate-pulse z-10">
          <div className="bg-neutral-700 rounded-full w-16 h-16 mb-4" />
          <div className="bg-neutral-700 h-6 w-40 rounded mb-2" />
          <div className="bg-neutral-700 h-4 w-24 rounded mb-4" />
          <div className="bg-neutral-700 h-32 w-64 rounded mb-2" />
          <div className="bg-neutral-700 h-4 w-32 rounded" />
        </div>
      )}
    <div ref={embedRef} className="w-full">
        <blockquote
          className="instagram-media"
      data-instgrm-permalink="https://www.instagram.com/quikspitboise/?utm_source=ig_embed&amp;utm_campaign=loading"
          data-instgrm-version="14"
      style={{ background: "#FFF", border: 0, borderRadius: "8px", boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)", margin: "0 auto", maxWidth: "100%", minWidth: 0, padding: 0, width: "100%" }}
        >
          {/* Instagram embed will load here */}
        </blockquote>
      </div>
    </div>
  );
}
