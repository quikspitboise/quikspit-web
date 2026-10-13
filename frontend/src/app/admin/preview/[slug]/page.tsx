import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/content/content-page';
import { PREVIEW_PATH_PREFIX } from '@/components/content/site-chrome';
import { SiteContentProvider } from '@/components/content/site-content-context';
import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { requireAdminPageAuth } from '@/lib/server/admin-auth';
import { getDraftContent } from '@/lib/server/content-api';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Draft preview',
  robots: { index: false, follow: false },
};

type PreviewProps = { params: Promise<{ slug: string }> };

/**
 * A page as it would look if every saved draft (shared site details, prices,
 * and this page) were published. Private to admins; nothing here is cached.
 */
export default async function DraftPreviewPage({ params }: PreviewProps) {
  await requireAdminPageAuth();
  const { slug } = await params;
  const draft = await getDraftContent(slug);
  if (!draft) notFound();

  const { site } = draft.content;
  return (
    <SiteContentProvider site={site}>
      <Navigation site={site} previewBase={PREVIEW_PATH_PREFIX} />
      <ContentPage content={draft.content} page={draft.page} slug={slug} preview />
      <Footer site={site} previewBase={PREVIEW_PATH_PREFIX} />
      <p
        role="status"
        className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-3 z-50 rounded-full border border-amber-400/40 bg-black/85 px-3 py-1.5 text-xs font-medium text-amber-200"
      >
        Draft preview · not public
      </p>
    </SiteContentProvider>
  );
}
