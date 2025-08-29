import { useEffect, useRef, useState } from "react";

export default function TikTokEmbedWithSkeleton() {
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
    <div className="relative w-full max-w-md min-h-[400px]">
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
          className="tiktok-embed"
          cite="https://www.tiktok.com/@quikspitshine"
          data-unique-id="quikspitshine"
          data-embed-type="creator"
          style={{ maxWidth: "780px", minWidth: "288px" }}
        >
          <section>
            <a target="_blank" href="https://www.tiktok.com/@quikspitshine?refer=creator_embed">@quikspitshine</a>
          </section>
        </blockquote>
      </div>
    </div>
  );
}
