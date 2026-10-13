import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UserButton } from '@/components/clerk-ui';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { requireAdminPageAuth } from '@/lib/server/admin-auth';
import { fetchAdminBookingSettings } from '@/lib/server/booking-settings-api';
import { fetchAdminContentSummaries, getPublishedContent } from '@/lib/server/content-api';
import { fetchAdminGalleryItems } from '@/lib/server/gallery-api';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPage() {
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

  const { userId } = await requireAdminPageAuth();
  if (!userId) notFound();
  const [items, bookingSettings, summaries, published] = await Promise.all([
    fetchAdminGalleryItems(),
    fetchAdminBookingSettings(),
    fetchAdminContentSummaries().catch((error) => {
      console.error('Unable to load content documents for admin', error);
      return null;
    }),
    getPublishedContent(),
  ]);

  const pages = summaries
    ?.filter((summary) => summary.kind === 'page')
    .map(({ key, title, hasUnpublishedChanges, publishedAt }) => ({ key, title, hasUnpublishedChanges, publishedAt })) ?? null;
  const priceSources = [
    ...published.catalog.categories.map((category) => ({ value: `category:${category.id}`, label: `${category.label} packages` })),
    ...published.catalog.ceramicServices
      .filter((service) => service.kind === 'coating')
      .map((service) => ({ value: `service:${service.id}`, label: `${service.name}, with an eligible package` })),
  ];

  return (
    <main id="main-content" className="min-h-screen bg-transparent pb-16 pt-6 lg:pt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-3xl text-white uppercase sm:text-4xl">Site admin</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Edits stay private until you publish. <a href="/" target="_blank" rel="noopener" className="text-neutral-200 underline underline-offset-2 hover:text-white">View the site</a>
              </p>
            </div>
            <UserButton />
          </header>

          <AdminDashboard
            currentUserId={userId}
            galleryItems={items}
            bookingSettings={bookingSettings}
            pages={pages}
            priceSources={priceSources}
          />
        </div>
      </div>
    </main>
  );
}
