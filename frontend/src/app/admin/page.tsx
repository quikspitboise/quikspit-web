import type { Metadata } from 'next';
import { UserButton } from '@/components/clerk-ui';
import { BookingSettingsAdmin } from '@/components/admin/booking-settings-admin';
import { GalleryAdminClient } from '@/components/admin/gallery-admin-client';
import { GlassCard } from '@/components/ui/glass-card';
import { requireAdminPageAuth } from '@/lib/server/admin-auth';
import { fetchAdminBookingSettings } from '@/lib/server/booking-settings-api';
import { fetchAdminGalleryItems } from '@/lib/server/gallery-api';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminGalleryPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main id="main-content" className="min-h-screen bg-transparent py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-white text-2xl font-semibold mb-4">Auth not configured locally</h1>
            <p className="text-neutral-400">
              Set <code className="text-red-400">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to use the admin panel.
            </p>
          </div>
        </div>
      </main>
    );
  }

  await requireAdminPageAuth();
  const [items, bookingSettings] = await Promise.all([
    fetchAdminGalleryItems(),
    fetchAdminBookingSettings(),
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-transparent py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <GlassCard className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8" gradient="red">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-red-300">Private admin</p>
              <h1 className="mt-3 font-display text-4xl text-white tracking-wide">
                Gallery management
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-neutral-300 lg:text-base">
                This hidden route is protected by Clerk on the frontend and by verified Clerk tokens plus an explicit admin allowlist on the backend.
              </p>
            </div>

            <div className="flex items-center gap-3 text-white">
              <span className="text-sm text-neutral-300">Signed in</span>
              <UserButton />
            </div>
          </GlassCard>

          <BookingSettingsAdmin initialSettings={bookingSettings} />

          <GalleryAdminClient initialItems={items} />
        </div>
      </div>
    </main>
  );
}
