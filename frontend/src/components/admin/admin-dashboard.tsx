'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { BookingSettings } from '@/lib/booking-settings';
import type { GalleryAdminItem } from '@/lib/gallery';
import { BookingSettingsAdmin } from './booking-settings-admin';
import { CatalogEditor } from './content/catalog-editor';
import type { PreviewTarget } from './content/document-shell';
import { PagesEditor, type PageListItem } from './content/pages-editor';
import type { CatalogOption } from './content/section-schemas';
import { SiteEditor } from './content/site-editor';
import { GalleryAdmin } from './gallery/gallery-admin';
import { AdminFeedbackProvider, Notice, cx } from './ui';
import { UnsavedChangesProvider } from './unsaved-changes';

const TABS = [
  { id: 'pages', label: 'Pages' },
  { id: 'business', label: 'Business & site' },
  { id: 'prices', label: 'Services & prices' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'booking', label: 'Booking' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export type AdminDashboardProps = {
  currentUserId: string;
  galleryItems: GalleryAdminItem[];
  bookingSettings: BookingSettings;
  /** Null when the content API is unavailable (for example, before migrating). */
  pages: PageListItem[] | null;
  priceSources: CatalogOption[];
};

export function AdminDashboard({ currentUserId, galleryItems, bookingSettings, pages, priceSources }: AdminDashboardProps) {
  const [tab, setTab] = useState<TabId>('pages');
  // Tabs mount on first visit and then stay mounted, so switching never loses edits.
  const [visited, setVisited] = useState<Set<TabId>>(() => new Set(['pages']));

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    const match = TABS.find((entry) => entry.id === requested);
    if (match) {
      setTab(match.id);
      setVisited((current) => new Set(current).add(match.id));
    }
  }, []);

  const select = (id: TabId) => {
    setTab(id);
    setVisited((current) => new Set(current).add(id));
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    window.history.replaceState(null, '', url);
  };

  const previewTargets: PreviewTarget[] = (pages ?? []).map((page) => ({ slug: page.key.slice(5), label: page.title }));
  const homeFirst = [...previewTargets].sort((a, b) => Number(b.slug === 'home') - Number(a.slug === 'home'));
  const pricingFirst = [...previewTargets].sort((a, b) => Number(b.slug === 'pricing') - Number(a.slug === 'pricing'));

  const contentUnavailable = (
    <Notice tone="warning">
      Site content could not be loaded. If the backend was just updated, run its database migration, then reload this page.
    </Notice>
  );

  const panels: Record<TabId, ReactNode> = {
    pages: pages ? <PagesEditor pages={pages} currentUserId={currentUserId} priceSources={priceSources} /> : contentUnavailable,
    business: pages ? <SiteEditor currentUserId={currentUserId} previewTargets={homeFirst} /> : contentUnavailable,
    prices: pages ? <CatalogEditor currentUserId={currentUserId} previewTargets={pricingFirst} /> : contentUnavailable,
    gallery: <GalleryAdmin initialItems={galleryItems} />,
    booking: <BookingSettingsAdmin initialSettings={bookingSettings} />,
  };

  return (
    <AdminFeedbackProvider>
      <UnsavedChangesProvider>
        <div
          role="tablist"
          aria-label="Admin sections"
          className="sticky top-[var(--nav-total-height)] z-40 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-white/10 bg-black/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {TABS.map((entry) => {
            const active = entry.id === tab;
            return (
              <button
                key={entry.id}
                id={`admin-tab-${entry.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`admin-panel-${entry.id}`}
                onClick={() => select(entry.id)}
                className={cx(
                  'relative min-h-12 shrink-0 whitespace-nowrap px-3 text-sm font-medium transition-colors',
                  active ? 'text-white' : 'text-neutral-400 hover:text-white',
                )}
              >
                {entry.label}
                <span className={cx('absolute inset-x-3 bottom-0 h-0.5 bg-red-500 transition-transform', active ? 'scale-x-100' : 'scale-x-0')} />
              </button>
            );
          })}
        </div>

        {TABS.map((entry) =>
          visited.has(entry.id) ? (
            <div
              key={entry.id}
              id={`admin-panel-${entry.id}`}
              role="tabpanel"
              aria-labelledby={`admin-tab-${entry.id}`}
              hidden={entry.id !== tab}
            >
              {panels[entry.id]}
            </div>
          ) : null,
        )}
      </UnsavedChangesProvider>
    </AdminFeedbackProvider>
  );
}
