import { MagneticButton } from '@/components/ui/magnetic-button';

interface SocialEmbedCardProps {
  platform: 'instagram' | 'tiktok';
  handle: string;
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

const platformConfig = {
  instagram: {
    accent: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400',
    skeletonAccent: 'bg-pink-500/15',
    followUrl: 'https://www.instagram.com/quikspitboise/',
    label: 'Instagram',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  tiktok: {
    accent: 'bg-gradient-to-r from-cyan-400 via-white/80 to-rose-500',
    skeletonAccent: 'bg-cyan-400/15',
    followUrl: 'https://www.tiktok.com/@quikspitboise',
    label: 'TikTok',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
  },
};

export function SocialEmbedCard({ platform, handle, loading, children, className = '' }: SocialEmbedCardProps) {
  const config = platformConfig[platform];

  return (
    <div className={`glass-card glass-card-hover overflow-hidden ${className}`}>
      {/* Static platform color bar for recognition */}
      <div className={`h-[3px] ${config.accent}`} aria-hidden="true" />

      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
        <div className="text-white">{config.icon}</div>
        <span className="font-display text-base text-white tracking-wide">{handle}</span>
      </div>

      <div className="relative min-h-[360px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6" aria-hidden="true">
            <div className={`${config.skeletonAccent} rounded-full w-16 h-16 mb-4 animate-pulse`} />
            <div className={`${config.skeletonAccent} h-5 w-36 rounded mb-2 animate-pulse`} />
            <div className={`${config.skeletonAccent} h-3 w-24 rounded mb-6 animate-pulse`} />
            <div className="w-full space-y-3">
              <div className={`${config.skeletonAccent} h-3 w-full rounded animate-pulse`} />
              <div className={`${config.skeletonAccent} h-3 w-5/6 rounded animate-pulse`} />
              <div className={`${config.skeletonAccent} h-3 w-4/6 rounded animate-pulse`} />
            </div>
          </div>
        )}
        {children}
      </div>

      <div className="px-5 py-4 border-t border-white/[0.06]">
        <MagneticButton
          href={config.followUrl}
          variant="secondary"
          size="sm"
          className="w-full justify-center"
        >
          Follow on {config.label}
        </MagneticButton>
      </div>
    </div>
  );
}
